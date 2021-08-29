import { DirectoryRoute, InterfaceRoute, RequestContext } from "../system/classes";
import { ContentType } from "../system/types";
import { Routes } from "../system/httpserver";

import HTTPServer from "../server";
import Conf from "../system/utils/Configuration";

export default class DynamicService {
    constructor(base: HTTPServer) {
        this.base = base;
    }

    private base: HTTPServer;

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

                try {
                    const action = await route.onRequest(context), result = await action.execute(context);
                    context.end(result ? this.base.renderSharedTemplate(result) : "");
                }
                catch {
                    console.log(`Directory/Interface resource exception from: ${context.requestId}.`);
                    this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.SvrError);
                }
            }
            else if (!context.session?.isValid()) {
                context.redirect(Conf.Router.DefaultRoute);
            }
        }
        else {
            this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.NotFound);
        }
    }
};