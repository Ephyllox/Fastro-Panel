import * as HTTP from "http";

import { CookieOptions, ContentType, InputTypes } from "../../types";

import Session from "../auth/objects/SessionObject";
import CookieBuilder from "./CookieBuilder";

export default class RequestContext {
    constructor({ req, res }, reqId: string, session: Session) {
        this.session = session;
        this.requestId = reqId;
        this.req = req;
        this.res = res;
    }

    public requestId: string;

    public session: Session;

    public input: InputTypes;

    public req: HTTP.IncomingMessage;

    private res: HTTP.ServerResponse;

    json(json: object) {
        this.res.end(JSON.stringify(json));
    }

    status(status: number): this {
        this.res.statusCode = status;
        return this;
    }

    header(header: string, value: string): this {
        this.res.setHeader(header, value);
        return this;
    }

    redirect(path: string) {
        this.status(302).header("Location", path).end();
    }

    contentType(type: ContentType): this {
        this.header("Content-Type", type);
        return this;
    }

    cookie(options: CookieOptions): this {
        this.header("Set-Cookie", new CookieBuilder(options).parse());
        return this;
    }

    end(content?) {
        this.res.end(content);
    }
};