import { AssertionError } from "assert";

import { AuthorizationError, DirectoryRoute, InputHandler, InterfaceRoute, RateLimiter, RequestContext } from "../../system/_classes";
import { IHttpServiceHandler } from "../../system/_interfaces";
import { Routes } from "../../system/http/routes";

import HTTPServer from "../../server";
import Conf from "../../utils/Configuration";

export default class DynamicService implements IHttpServiceHandler {
    constructor(base: HTTPServer) {
        this.base = base;
    }

    base: HTTPServer;

    limiter: RateLimiter = new RateLimiter();

    async process(context: RequestContext, url: string) {
        const route = Routes.find(item => item.path === url);

        if (route) {
            const key = route.path + context.remoteAddress;

            if (route instanceof DirectoryRoute) {
                if (context.method !== "GET") return context.status(405).end();
                if (route.blocked || !route.isUserAuthorized(context)) return this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.Unauthorized, 403);
            }
            else if (route instanceof InterfaceRoute) {
                if (!route.methods.includes(context.method)) return context.status(405).end();
                if (route.blocked || !route.isUserAuthorized(context)) return context.status(403).end();

                if (route.ratelimit && this.limiter.checkTimeout(key, route.ratelimit.maxRequests, route.ratelimit.preserveRate) > 0) {
                    this.base._log(`Rate limit triggered at: [${route.path}], from: [${context.remoteAddress}, ${context.session?.user?.name ?? "*"}].`, "yellow");
                    return context.text(route.ratelimit.message ?? "Too Many Requests", 429);
                }
            }

            if (context.session?.isValid || !route.requiresLogin) {
                if (route instanceof DirectoryRoute && context.session?.isValid && !context.session.pendingMsa && route.redirectIfAuthorized) {
                    return context.redirect(route.redirectIfAuthorized);
                }

                // Check that all inputted data is valid
                if (await InputHandler.handle(context, route)) {
                    try {
                        const action = await route.onRequest(context), result = await action.execute(context);

                        // When the action execution is successful, the rate counter is increased
                        if (route instanceof InterfaceRoute && route.ratelimit) {
                            this.limiter.checkRate(key, route.ratelimit.maxRequests, route.ratelimit.timeout, route.ratelimit.preserveRate);
                        }

                        context.end(result ?? undefined);
                    }
                    catch (error) {
                        const e = error as Error;

                        // AssertionError is thrown when invalid input data types are detected
                        // AuthorizationError is thrown when there are insufficient permissions
                        switch (e?.constructor) {
                            case route instanceof InterfaceRoute && AssertionError:
                                // Intended for interface routes only
                                return context.text(e.message, 400);
                            case route instanceof DirectoryRoute && AuthorizationError:
                                // Intended for directory routes only
                                return this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.Unauthorized, 403);
                        }

                        // Other exceptions lead to a general service error
                        this.base._log(`Directory/Interface resource exception from: ${context.requestId} -> ${e?.stack + e?.message}`, "redBright");

                        if (route instanceof InterfaceRoute) return context.text("Internal Server Error", 500);

                        this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.SvrError, 500);
                    }
                }
                else {
                    // TODO: Return a verbose description of missing JSON/query parameters
                    context.text("Invalid data submitted.", 400);
                }
            }
            else if (!context.session?.isValid) {
                if (route instanceof InterfaceRoute) {
                    return context.text("Session expired or invalid.", 401);
                }

                context.redirect(Conf.Router.DefaultRoute, {
                    "redir_after": context.req.url!, // Redirect to the requested page after login
                });
            }
        }
        else {
            if (url.startsWith(Conf.Router.APIDirectory)) return context.text(`Not Found: ${url}`, 404);

            this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.NotFound, 404);
        }
    }
};