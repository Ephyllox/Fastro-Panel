import * as HTTP from "http";
import * as Obfuscator from "javascript-obfuscator";

import { randomUUID } from "crypto";

import { AuthManager, RequestContext } from "./classes";
import { ContentType } from "./types";

import Utils from "./utils/Toolbox";
import Pages from "./utils/routes/PageRoutes";

process.on("uncaughtException", function (error) {
    console.log(`System error: ${error}.`);
});

HTTP.createServer(async function (req, res) {
    const context = new RequestContext({ req: req, res: res }, randomUUID(),
        AuthManager.getSession(Utils.getCookies(req)["__|SITE::SECURITY"]),
    );

    if (context.req.method === "GET") {
        const page = Pages[context.req.url];

        if (context.req.url === "/") {
            context.redirect("login");
        }
        else if (context.req.url.includes("/content/")) {
            const path = `./wwwroot/${context.req.url.replace("/content/", "")}`;
            let contentType: ContentType;

            Object.keys(ContentType).forEach(item => {
                if (path.endsWith(`.${item.toLowerCase()}`)) {
                    contentType = ContentType[item];
                }
            });

            try {
                let data = await Utils.readFile(path);

                if (contentType === ContentType.JS && !global[path]) {
                    data = Obfuscator.obfuscate(data, Obfuscator.getOptionsByPreset("default")).getObfuscatedCode()
                    global[path] = data;
                }

                context.contentType(contentType);
                context.end(global[path] ?? data);
            }
            catch {
                context.end(`Static resource invalid.\nRequest ID: ${context.requestId}`);
            }
        }
        else if (!page || page.systemRouted) {
            context.end(await Utils.readFile(Pages["404"].directory));
        }
        else if (page && !page.requiresLogin) {
            if (!context.session.isValid()) {
                context.end(await Utils.readFile(page.directory));
            }
            else {
                context.redirect(page.redirectIfAuthorized);
            }
        }
        else if (page.requiresLogin && context.session.isValid()) {
            context.end(await Utils.readFile(page.directory));
        }
        else if (page.requiresLogin && !context.session.isValid()) {
            context.redirect("login");
        }
    }
    else if (context.req.method === "POST") {
        if (context.req.url === "/validate-login") {
            if (context.req.headers["username"]) {
                const validation = AuthManager.checkLogin(context.req.headers["username"], context.req.headers["password"]);

                if (validation) {
                    context.cookie(validation);
                }
                else {
                    context.status(401);
                }
            }
            else {
                context.status(400);
            }
        }
        else if (context.req.url === "/logout") {
            if (context.session.isValid()) {
                context.session.invalidate();
            }
            else {
                context.status(401);
            }
        }
        else if (context.req.url === "/identity") {
            if (context.session.isValid()) {
                return context.end(context.session.toJSON());
            }
            else {
                context.status(401);
            }
        }
        else {
            context.status(404);
        }

        context.end();
    }
    else {
        context.status(405).end();
    }
}).listen(process.env.PORT || 1337);