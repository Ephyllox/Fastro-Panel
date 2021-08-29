import * as HTTP from "http";
import * as EJS from "ejs";

import { randomUUID } from "crypto";

import { ContentType } from "./system/types";
import { RequestContext, AuthManager, DirectoryRoute, InterfaceRoute } from "./system/classes";
import { Routes } from "./system/httpserver";

import StaticService from "./handlers/StaticService";
import DynamicService from "./handlers/DynamicService";

import Conf from "./system/utils/Configuration";
import Utils from "./system/utils/Toolbox";

export default class HTTPServer {
    constructor() {
        this.init();
    }

    private staticHandler: StaticService;
    private dynamicHandler: DynamicService;

    private init() {
        for (const route of Routes) {
            if (route instanceof InterfaceRoute) {
                this.methods[route.method] = true;
            }
            else if (route instanceof DirectoryRoute) {
                this.methods["GET"] = true;
            }
        }

        this.staticHandler = new StaticService(this);
        this.dynamicHandler = new DynamicService(this);

        this.listen();
    }

    private listen() {
        const _ = this;

        HTTP.createServer(function (req, res) {
            const context = new RequestContext({ req: req, res: res }, randomUUID(),
                AuthManager.getSession(Utils.getCookies(req)[Conf.Session.CookieName]),
            );

            //console.log(`Request to '~${url}': [Trace=${context.requestId}], [Identity=${context.session.user?.id}].`);
            const url = context.req.url.split("?")[0];

            if (_.methods[context.req.method]) {
                if (Conf.Security.AddSecurityHeaders) _.applySecurityHeaders(context);
                _.applyCustomHeaders(context);

                if (url === "/" && Conf.Router.EnableDefaultRedirect) {
                    context.redirect(Conf.Router.DefaultRoute);
                }
                else if (!url.startsWith(Conf.Static.RequestDirectory) || !Conf.Static.EnableStaticFileServer) {
                    _.dynamicHandler.process(context, url);
                }
                else {
                    if (context.req.method !== "GET") return context.status(405).end();
                    _.staticHandler.process(context, url);
                }
            }
            else {
                console.log(`Forbidden method requested from: ${context.requestId}.`);
                context.status(405).end();
            }
        }).listen(process.env.PORT || 1337);

        if (!global["CABU-PERSIST"]) global["CABU-PERSIST"] = Math.random();
    }

    renderSharedTemplate(content: string) {
        return EJS.render(content, {
            copyright: `${new Date().getFullYear()} - Universe`,
            cabu: global["CABU-PERSIST"],
        });
    }

    async renderActionFailure(context: RequestContext, path: string) {
        const data = await Utils.readFile(path);
        context.contentType(ContentType.HTML);

        context.end(
            EJS.render(data, {
                reqId: context.requestId,
            })
        );
    }

    private applyCustomHeaders(context: RequestContext) {
        context.header("Server", "Abstractor 2000");
    }

    private applySecurityHeaders(context: RequestContext) {
        context.header("Content-Security-Policy", "block-all-mixed-content; upgrade-insecure-requests;");
        context.header("Referrer-Policy", "no-referrer");
        context.header("Strict-Transport-Security", "max-age: 15552000; includeSubDomains; preload;");
        context.header("X-Content-Type-Options", "nosniff");
        context.header("X-Download-Options", "noopen");
        context.header("X-Frame-Options", "SAMEORIGIN");
        context.header("X-Permitted-Cross-Domain-Policies", "none");
        context.header("X-XSS-Protection", "0");
    }

    private methods = {};
};