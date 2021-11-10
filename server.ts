import * as HTTP from "http";
import * as EJS from "ejs";
import * as WS from "ws";

import { randomUUID } from "crypto";

import { RequestContext, AuthManager, DirectoryRoute, InterfaceRoute, Session } from "./system/_classes";
import { IHttpServiceHandler } from "./system/_interfaces";
import { ContentType } from "./system/_types";
import { Routes } from "./system/http/routes";

import StaticService from "./handlers/http-service/StaticService";
import DynamicService from "./handlers/http-service/DynamicService";
import WebsocketService from "./handlers/WebsocketService";

import Conf from "./utils/Configuration";
import Utils from "./utils/Toolbox";

export default class HTTPServer {
    constructor() {
        if (Conf.Websocket.EnableWebsocket) this.initWS();

        this.initHTTP();
    }

    private staticHandler: IHttpServiceHandler;
    private dynamicHandler: IHttpServiceHandler;
    private websocketHandler: WebsocketService;

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
        this.websocketHandler = new WebsocketService(new WS.Server({ noServer: true }));

        this.listenWS();
    }

    private listenHTTP() {
        const _ = this; //eslint-disable-line

        const server = HTTP.createServer(function (req, res) {
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

        if (Conf.Websocket.EnableWebsocket) {
            server.on("upgrade", function (req, socket, head) {
                const session = AuthManager.getSession(Utils.getCookies(req)[Conf.Session.CookieName]);

                if (!session.isValid()) return req.destroy();

                _.websocketHandler.server.handleUpgrade(req, socket, head, function (ws) {
                    _.websocketHandler.server.emit("connection", ws, session);
                });
            });
        }

        if (!global["CABU-PERSIST"]) global["CABU-PERSIST"] = Utils.nonce();
    }

    private listenWS() {
        const _ = this; //eslint-disable-line

        this.websocketHandler.server.on("connection", function (ws, session: Session) {
            _.websocketHandler.socketAttached(ws, session);

            ws.on("message", function (data: string) {
                _.websocketHandler.incomingMessage(data, session);
            });

            ws.on("close", _.websocketHandler.socketDetached);
        });
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