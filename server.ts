import * as Mustache from "mustache";
import * as HTTP from "http";
import * as XSS from "xss";

import { randomUUID } from "crypto";

import { RequestContext, AuthManager, DirectoryRoute, InterfaceRoute } from "./system/_classes";
import { IHttpServiceHandler } from "./system/_interfaces";
import { ContentType } from "./system/_types";
import { Routes, loadRoutes } from "./system/http/routes";

import StaticService from "./handlers/http-service/StaticService";
import DynamicService from "./handlers/http-service/DynamicService";

import LogDelegate from "./utils/Logging";
import Conf from "./utils/Configuration";
import Utils from "./utils/Toolbox";

export default class HTTPServer {
    constructor(log: LogDelegate) {
        this._log = log;

        this.initHTTP();

        // Clear expired auth items every half-hour
        setInterval(async () => {
            await AuthManager.removeExpiredItems();
            this._log("Removed expired sessions and bypass tokens!", "gray");
        }, 864e5);
    }

    private staticHandler!: IHttpServiceHandler;
    private dynamicHandler!: IHttpServiceHandler;

    private _cacheKey = Utils.nonce();

    public _log: LogDelegate;

    private getRemoteAddress(req: HTTP.IncomingMessage) {
        return req.headers["cf-connecting-ip"] as string ?? req.socket.remoteAddress;
    }

    private initHTTP() {
        this._log("Loading all routes...", "blue");

        loadRoutes(this._log).then(() => {
            for (const route of Routes) {
                if (route instanceof InterfaceRoute) {
                    route.methods.forEach(method => this.methods[method] = true);
                }
                else if (route instanceof DirectoryRoute) {
                    this.methods["GET"] = true;
                }
            }

            this._log(`Activated ${Routes.length} route(s)`, "green");

            this.staticHandler = new StaticService(this);
            this.dynamicHandler = new DynamicService(this);

            this.listenHTTP();

            this._log("Server loaded!", "blue");
            this._log(`Global static content cache key: ${this._cacheKey}`, "cyan");
        });
    }

    private listenHTTP() {
        const server = HTTP.createServer(async (req, res) => {
            try {
                const ip = this.getRemoteAddress(req);

                const context = new RequestContext({ req: req, res: res }, this._log, randomUUID(), ip, this.sharedTemplate,
                    await AuthManager.getSessionByToken(Utils.getCookies(req)[Conf.Session.CookieName], ip),
                );

                // Remove the current session if it's expired
                if (!context.session?.isValid) {
                    context.session?.destroy();
                    delete context.session;
                }

                // All responses (except for top-level server exceptions) should apply headers
                if (Conf.Security.AddSecurityHeaders) this.applySecurityHeaders(context);
                this.applyCustomHeaders(context);

                // Ensure that both the URL and method are not undefined
                if (!context.req.url || !context.req.method) return context.status(400).end();

                const url = context.req.url.split("?")[0];
                const method = context.method;

                if (this.methods[method]) { // Check if the method is valid globally
                    if (url === "/" && Conf.Router.EnableDefaultRedirect) {
                        context.redirect(Conf.Router.DefaultRoute);
                    }
                    else if (!url.startsWith(Conf.Static.VirtualDirectory) || !Conf.Static.EnableStaticFileServer) {
                        this.dynamicHandler.process(context, url);
                    }
                    else {
                        if (method !== "GET") return context.status(405).end();

                        this.staticHandler.process(context, url);
                    }
                }
                else {
                    this._log(`Forbidden method [${method}] requested by: ${context.requestId}.`);

                    context.status(405).end();
                }
            }
            catch (error) { // Catch top-level exceptions - serious errors that could cause crashes
                const e = error as Error;

                this._log(e.message + e.stack, "red");

                res.statusCode = 500;
                res.end();
            }
        }).listen(process.env.PORT || Conf.Server.DefaultPort);
    }

    private get sharedTemplate() {
        return {
            copyright: `${new Date().getUTCFullYear()} - Multiverse Inc.`,
            version: this._cacheKey,
        };
    }

    async renderActionFailure(context: RequestContext, path: string, status: number = 200) {
        const data = await Utils.readFile(Conf.Static.Integrated.FileDirectory + path);

        context.contentType(ContentType.HTML);
        context.status(status);

        context.end(
            Mustache.render(XSS.stripCommentTag(data), {
                version: this._cacheKey,
                reqId: context.requestId,
                url: context.req.url,
            })
        );
    }

    private applyCustomHeaders(context: RequestContext) {
        context.header("Server", "Fastro-Panel");
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

    private methods: { [method: string]: boolean } = {};
};