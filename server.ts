import * as HTTP from "http";
import * as EJS from "ejs";

import { randomUUID } from "crypto";

import { RequestContext, AuthManager, DirectoryRoute, InterfaceRoute } from "./system/http-service/_classes";
import { IHttpServiceHandler } from "./system/http-service/_interfaces";
import { ContentType } from "./system/http-service/_types";
import { Routes } from "./system/http-service/data/routes";

import StaticService from "./handlers/http-service/StaticService";
import DynamicService from "./handlers/http-service/DynamicService";

import Conf from "./system/utils/Configuration";
import Utils from "./system/utils/Toolbox";

export default class HTTPServer {
    constructor() {
        if (Conf.Websocket.EnableWebsocket) this.initWS();
        this.initHTTP();
    }

    private staticHandler: IHttpServiceHandler;
    private dynamicHandler: IHttpServiceHandler;

    private initHTTP() {
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

        this.listenHTTP();
    }

    private initWS() {


        this.listenWS();
    }

    private listenHTTP() {
        const _ = this; //eslint-disable-line

        HTTP.createServer(function (req, res) {
            const context = new RequestContext({ req: req, res: res }, randomUUID(),
                AuthManager.getSession(Utils.getCookies(req)[Conf.Session.CookieName]),
            );

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

    private listenWS() {

    }

    renderSharedTemplate(content: string) {
        return EJS.render(content, {
            copyright: `${new Date().getFullYear()} - Universe`,
            cabu: global["CABU-PERSIST"],
        });
    }

    async renderActionFailure(context: RequestContext, path: string) {
        const data = await Utils.readFile(Conf.Static.Integrated.FileDirectory + path);
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
        context.header("Content-Security-Policy", "block-all-mixed-content;");
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