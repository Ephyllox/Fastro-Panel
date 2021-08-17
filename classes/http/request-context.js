"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_builder_1 = require("./cookie-builder");
class RequestContext {
    constructor({ req, res }, reqId, session) {
        this.session = session;
        this.requestId = reqId;
        this.req = req;
        this.res = res;
    }
    json(json) {
        this.res.end(JSON.stringify(json));
    }
    status(status) {
        this.res.writeHead(status);
        return this;
    }
    header(header, value) {
        this.res.writeHead(this.res.statusCode, { [header]: value });
        return this;
    }
    redirect(path) {
        this.status(302).header("Location", path).end();
    }
    contentType(type) {
        this.header("Content-Type", type);
        return this;
    }
    cookie(options) {
        this.header("Set-Cookie", new cookie_builder_1.default(options).parse());
        return this;
    }
    end(content) {
        this.res.end(content);
    }
}
exports.default = RequestContext;
;
