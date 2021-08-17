import * as FS from "fs";
import * as HTTP from "http";
import * as Obfuscator from "javascript-obfuscator";
import { randomUUID } from "crypto";
import AuthManager from "./classes/auth/manager";
import { RequestContext } from "./classes";
import Utils from "./utils/library";
import Pages from "./utils/web-pages";
import { ContentType } from "./enums";

process.on("uncaughtException", function (error) {
    console.log(`System error: ${error}.`);
});

HTTP.createServer(async function (req, res) {
    const context = new RequestContext({ req: req, res: res }, randomUUID(),
        AuthManager.getSession(Utils.getCookies(req)["__|SITE::SECURITY"]),
    );

    function readFile(name) {
        return new Promise<string>((resolve, reject) => {
            FS.readFile(`./pages/${name}.html`, "utf8", function (error, data) {
                !error ? resolve(data) : reject();
            });
        });
    }

    if (context.req.method === "GET") {
        const page = Pages[context.req.url];

        if (context.req.url === "/") {
            context.redirect("login");
        }
        else if (context.req.url.includes("/content/")) {
            const path = `./wwwroot/${context.req.url.replace("/content/", "")}`;
            let contentType = ContentType.PLAIN;

            Object.keys(ContentType).forEach(item => {
                if (path.endsWith(`.${item.toLowerCase()}`)) {
                    contentType = ContentType[item];
                }
            });

            FS.readFile(path, async function (error, data) {
                if (error) return context.end(`Static resource invalid.\nRequest ID: ${context.requestId}`);
                let final = data.toString();

                if (contentType === ContentType.JS && !global[path]) {
                    final = Obfuscator.obfuscate(final, Obfuscator.getOptionsByPreset("medium-obfuscation")).getObfuscatedCode()
                    global[path] = final;
                }

                context.contentType(contentType);
                context.end(global[path] ?? final);
            });
        }
        else if (!page) {
            context.contentType(ContentType.HTML);
            context.end(await readFile("not-found"));
        }
        else if (page && !page.RequiresLogin) {
            if (!context.session.isValid()) {
                context.contentType(ContentType.HTML);
                context.end(await readFile(page.Page));
            }
            else {
                context.redirect(page.RedirectIfAuthorized);
            }
        }
        else if (page.RequiresLogin && context.session.isValid()) {
            context.contentType(ContentType.HTML);

            context.end(await readFile(page.Page));
        }
        else if (page.RequiresLogin && !context.session.isValid()) {
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