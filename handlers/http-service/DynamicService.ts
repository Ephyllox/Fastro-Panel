import { DirectoryRoute, InputHandler, InterfaceRoute, RequestContext } from "../../system/http-service/_classes";
import { IHttpServiceHandler } from "../../system/http-service/_interfaces";
import { ContentType } from "../../system/http-service/_types";
import { Routes } from "../../system/http-service/data/routes";

import HTTPServer from "../../server";
import Conf from "../../system/utils/Configuration";

export default class DynamicService implements IHttpServiceHandler {
    constructor(base: HTTPServer) {
        this.base = base;
    }

    base: HTTPServer;

    async process(context: RequestContext, url: string) {
        const route = Routes.find(item => item.path === url);

        if (route) {
            if (route instanceof DirectoryRoute && context.req.method !== "GET") {
                return context.status(405).end();
            }
            else if (route instanceof InterfaceRoute && context.req.method !== route.method) {
                return context.status(405).end();
            }

            if (context.session?.isValid() || !route.requiresLogin) {
                if (route instanceof DirectoryRoute) {
                    context.contentType(ContentType.HTML);

                    if (context.session?.isValid() && route.redirectIfAuthorized) {
                        return context.redirect(route.redirectIfAuthorized);
                    }
                }

                if (await InputHandler.handle(context, route)) {
                    try {
                        const action = await route.onRequest(context), result = await action.execute(context);
                        context.end(result ? this.base.renderSharedTemplate(result) : "");
                    }
                    catch {
                        console.log(`Directory/Interface resource exception from: ${context.requestId}.`);
                        this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.SvrError);
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

                context.redirect(Conf.Router.DefaultRoute);
            }
        }
        else {
            this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.NotFound);
        }
    }
};