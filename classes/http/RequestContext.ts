import * as HTTP from "http";

import { ContentType } from "../../enums";
import { RequestActions } from "../../interfaces";
import { CookieOptions } from "../../types";

import Session from "../auth/SessionObject";
import CookieBuilder from "./CookieBuilder";

export default class RequestContext implements RequestActions {
    constructor({ req, res }, reqId: string, session: Session) {
        this.session = session;
        this.requestId = reqId;
        this.req = req;
        this.res = res;
    }

    public requestId: string;

    public session: Session;

    public req: HTTP.IncomingMessage;

    private res: HTTP.ServerResponse;

    json(json: object) {
        this.res.end(JSON.stringify(json));
    }

    status(status: number): this {
        this.res.writeHead(status);
        return this;
    }

    header(header: string, value: string): this {
        this.res.writeHead(this.res.statusCode, { [header]: value });
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