"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const HTTP = require("http");
const Obfuscator = require("javascript-obfuscator");
const crypto_1 = require("crypto");
const manager_1 = require("./classes/auth/manager");
const classes_1 = require("./classes");
const library_1 = require("./utils/library");
const web_pages_1 = require("./utils/web-pages");
const enums_1 = require("./enums");
process.on("uncaughtException", function (error) {
    console.log(`System error: ${error}.`);
});
HTTP.createServer(function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = new classes_1.RequestContext({ req: req, res: res }, crypto_1.randomUUID(), manager_1.default.getSession(library_1.default.getCookies(req)["__|SITE::SECURITY"]));
        function readFile(name) {
            return new Promise((resolve, reject) => {
                FS.readFile(`./pages/${name}.html`, "utf8", function (error, data) {
                    !error ? resolve(data) : reject();
                });
            });
        }
        if (context.req.method === "GET") {
            const page = web_pages_1.default[context.req.url];
            if (context.req.url === "/") {
                context.redirect("login");
            }
            else if (context.req.url.includes("/content/")) {
                const path = `./wwwroot/${context.req.url.replace("/content/", "")}`;
                let contentType = enums_1.ContentType.PLAIN;
                Object.keys(enums_1.ContentType).forEach(item => {
                    if (path.endsWith(`.${item.toLowerCase()}`)) {
                        contentType = enums_1.ContentType[item];
                    }
                });
                FS.readFile(path, function (error, data) {
                    var _a;
                    return __awaiter(this, void 0, void 0, function* () {
                        if (error)
                            return context.end(`Static resource invalid.\nRequest ID: ${context.requestId}`);
                        let final = data.toString();
                        if (contentType === enums_1.ContentType.JS && !global[path]) {
                            final = Obfuscator.obfuscate(final, Obfuscator.getOptionsByPreset("medium-obfuscation")).getObfuscatedCode();
                            global[path] = final;
                        }
                        context.contentType(contentType);
                        context.end((_a = global[path]) !== null && _a !== void 0 ? _a : final);
                    });
                });
            }
            else if (!page) {
                context.contentType(enums_1.ContentType.HTML);
                context.end(yield readFile("not-found"));
            }
            else if (page && !page.RequiresLogin) {
                if (!context.session.isValid()) {
                    context.contentType(enums_1.ContentType.HTML);
                    context.end(yield readFile(page.Page));
                }
                else {
                    context.redirect(page.RedirectIfAuthorized);
                }
            }
            else if (page.RequiresLogin && context.session.isValid()) {
                context.contentType(enums_1.ContentType.HTML);
                context.end(yield readFile(page.Page));
            }
            else if (page.RequiresLogin && !context.session.isValid()) {
                context.redirect("login");
            }
        }
        else if (context.req.method === "POST") {
            if (context.req.url === "/validate-login") {
                if (context.req.headers["username"]) {
                    const validation = manager_1.default.checkLogin(context.req.headers["username"], context.req.headers["password"]);
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
    });
}).listen(process.env.PORT || 1337);
