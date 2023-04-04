import * as HTTP from "http";

import { CookieOptions, ContentType, InputTypes } from "../../_types";

import Session from "../auth/objects/SessionObject";
import CookieBuilder from "./CookieBuilder";

type ContextBinding = {
    req: HTTP.IncomingMessage;
    res: HTTP.ServerResponse;
}

export default class RequestContext {
    constructor({ req, res }: ContextBinding, reqId: string, session: Session) {
        this.session = session;
        this.requestId = reqId;
        this.req = req;
        this.res = res;

        this.input = {
            body: undefined,
            query: {},
        };
    }

    public requestId: string;

    public session: Session;

    public input: InputTypes;

    public req: HTTP.IncomingMessage;

    private res: HTTP.ServerResponse;

    text(data: string, status?: number) {
        if (status) this.status(status);
        this.res.end(data, "utf-8");
    }

    json(json: object, status?: number) {
        if (status) this.status(status);
        this.res.end(JSON.stringify(json), "utf-8");
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

    end(content?: string) {
        this.res.end(content);
    }
};