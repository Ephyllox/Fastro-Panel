import * as HTTP from "http";
import * as Obfuscator from "javascript-obfuscator";
import * as Mustache from "mustache";

import { randomUUID } from "crypto";

import { ContentType } from "./system/types";
import { RequestContext, AuthManager, DirectoryRoute, InterfaceRoute } from "./system/classes";
import { Routes } from "./system/httpserver";

import Conf from "./system/utils/Configuration";
import Utils from "./system/utils/Toolbox";

export default class HTTPServer {
    constructor() {
        this.preload();
        this.listen();
    }

    private preload() {
        for (const route of Routes) {
            if (route instanceof InterfaceRoute) {
                this.methods[route.method] = true;
            }
            else if (route instanceof DirectoryRoute) {
                this.methods["GET"] = true;
            }
        }
    }

    private listen() {
        const _ = this;

        HTTP.createServer(async function (req, res) {
            const context = new RequestContext({ req: req, res: res }, randomUUID(),
                AuthManager.getSession(Utils.getCookies(req)[Conf.Session.CookieName]),
            );

            //console.log(`Request to '~${context.req.url}': [Trace=${context.requestId}], [Identity=${context.session.user?.id}].`);

            if (_.methods[context.req.method]) {
                if (Conf.Security.AddSecurityHeaders) _.applySecurityHeaders(context);
                _.applyCustomHeaders(context);

                if (context.req.url === "/" && Conf.Router.EnableDefaultRedirect) {
                    context.redirect(Conf.Router.DefaultRoute);
                }
                else if (!context.req.url.startsWith(Conf.Static.RequestDirectory) || !Conf.Static.EnableStaticFileServer) {
                    const route = Routes.find(item => item.path === context.req.url);

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
                                context.end(result ? _.applyCustomTemplate(result) : "");
                            }
                            catch {
                                console.log(`Dynamic resource exception from: ${context.requestId}.`);
                                _.finalShrdTemplate(context, "pages/errors/server-error.html");
                            }
                        }
                        else if (!context.session?.isValid()) {
                            context.redirect(Conf.Router.DefaultRoute);
                        }
                    }
                    else {
                        _.finalShrdTemplate(context, "pages/errors/not-found.html");
                    }
                }
                else {
                    if (context.req.method !== "GET") return context.status(405).end();

                    const path = Conf.Static.PhysicalDirectory + context.req.url.replace(Conf.Static.RequestDirectory, "");
                    let contentType: ContentType;

                    Object.keys(ContentType).forEach(item => {
                        if (path.endsWith(`.${item.toLowerCase()}`)) {
                            contentType = ContentType[item];
                        }
                    });

                    try {
                        let data = await Utils.readFile(path);

                        if (Conf.Static.EnableRuntimeObfuscation && contentType === ContentType.JS && !global[path]) {
                            data = Obfuscator.obfuscate(data, Obfuscator.getOptionsByPreset("default")).getObfuscatedCode();
                            global[path] = data;
                        }

                        context.contentType(contentType);
                        context.end(global[path] ?? data);
                    }
                    catch {
                        console.log(`Static resource exception from: ${context.requestId}.`);
                        _.finalShrdTemplate(context, "pages/errors/server-error.html");
                    }
                }
            }
            else {
                console.log(`Forbidden method requested from: ${context.requestId}.`);
                context.status(405).end();
            }
        }).listen(process.env.PORT || 1337);
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

    private applyCustomTemplate(content: string) {
        return Mustache.render(content, {
            copyright: `Copyright &copy; ${new Date().getFullYear()} - Indev Corp!`,
        }, null, {
            escape: (str) => str,
        });
    }

    private async finalShrdTemplate(context: RequestContext, path: string) {
        const data = await Utils.readFile(path);
        context.contentType(ContentType.HTML);

        context.end(
            Mustache.render(data, {
                reqId: context.requestId,
            })
        );
    }

    private methods = {};
};