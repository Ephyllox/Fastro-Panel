import { AssertionError } from "assert";

import { DirectoryRoute, InputHandler, InterfaceRoute, RequestContext } from "../../system/_classes";
import { IHttpServiceHandler } from "../../system/_interfaces";
import { ContentType } from "../../system/_types";
import { Routes } from "../../system/http/routes";

import HTTPServer from "../../server";
import Conf from "../../utils/Configuration";

export default class DynamicService implements IHttpServiceHandler {
    constructor(base: HTTPServer) {
        this.base = base;
    }

    base: HTTPServer;

    async process(context: RequestContext, url: string) {
        const route = Routes.find(item => item.path === url);

        if (route) {
            if (route instanceof DirectoryRoute) {
                if (route.blocked) return this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.Unauthorized, 403);
                if (context.req.method !== "GET") return context.status(405).end();
            }
            else if (route instanceof InterfaceRoute) {
                if (route.blocked) return context.status(403).end();
                if (context.req.method !== route.method) return context.status(405).end();
            }

            if (context.session?.isValid() || !route.requiresLogin) {
                if (route instanceof DirectoryRoute) {
                    context.contentType(ContentType.HTML);

                    if (context.session?.isValid() && route.redirectIfAuthorized) {
                        return context.redirect(route.redirectIfAuthorized);
                    }
                }

                // Check that all inputted data is valid
                if (await InputHandler.handle(context, route)) {
                    try {
                        const action = await route.onRequest(context), result = await action.execute(context);

                        // ISSUE?: Regardless of route type, this still applies templating
                        context.end(result ? this.base.renderSharedTemplate(result) : "");
                    }
                    catch (e) {
                        // AssertionError is thrown when invalid input data types are detected
                        switch (e?.constructor) {
                            case AssertionError:
                                return context.status(400).end(e.message);
                        }

                        // Other exceptions lead to a general service error
                        this.base._log(`Directory/Interface resource exception from: ${context.requestId} -> ${e?.stack + e?.message}`, "yellow");

                        this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.SvrError, 500);
                    }
                }
                else {
                    context.status(400).end("Invalid data submitted.");
                }
            }
            else if (!context.session?.isValid()) {
                if (route instanceof InterfaceRoute) {
                    return context.status(401).end();
                }

                //this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.Unauthorized, 401);
                context.redirect(Conf.Router.DefaultRoute);
            }
        }
        else {
            if (url.startsWith(Conf.Router.APIDirectory)) return context.text(`Not Found: ${url}`, 404);

            this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.NotFound, 404);
        }
    }
};