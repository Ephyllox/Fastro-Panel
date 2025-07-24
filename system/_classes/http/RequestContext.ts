import * as HTTP from "http";

import { SessionModel } from "../../../database/models";

import { CookieOptions, ContentType, InputTypes, HttpMethod } from "../../_types";

import LogDelegate from "../../../utils/Logging";
import CookieBuilder from "./CookieBuilder";

type ContextBinding = {
    req: HTTP.IncomingMessage;
    res: HTTP.ServerResponse;
};

export type RedirectParameters = { [key: string]: string };

export default class RequestContext {
    constructor({ req, res }: ContextBinding, log: LogDelegate, reqId: string, ip: string, template: object, session?: SessionModel) {
        this.session = session;
        this.requestId = reqId;
        this.remoteAddress = ip;
        this.template = template;
        this.req = req;
        this.res = res;

        this.method = req.method as HttpMethod;

        this.input = {
            body: undefined,
            query: {},
        };

        this._log = log;
    }


    public requestId: string;

    public remoteAddress: string;

    public template: object;

    public session?: SessionModel;

    public input: InputTypes;

    public method: HttpMethod;

    public req: HTTP.IncomingMessage;

    private res: HTTP.ServerResponse;

    public _log: LogDelegate;

    text(data: string, status?: number) {
        if (status) this.status(status);
        this.contentType(ContentType.TXT);
        this.res.end(data, "utf-8");
    }

    json(json: object, status?: number) {
        if (status) this.status(status);
        this.contentType(ContentType.JSON);
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

    redirect(path: string, params?: RedirectParameters) {
        if (params) {
            Object.entries(params).forEach((param, index) => {
                // With the first parameter, '?' should be the delimiter, otherwise '&' is used
                const delimiter = index === 0 ? "?" : "&";
                path += `${delimiter}${param[0]}=${param[1]}`;
            });
        }

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