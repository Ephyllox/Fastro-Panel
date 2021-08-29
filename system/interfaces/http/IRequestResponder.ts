import { RequestContext } from "../../classes";
import { CookieOptions, ContentType } from "../../types";

export default interface RequestResponder {
    json(json: object);

    status(status: number): RequestContext;

    header(header: string, value: string): RequestContext;

    redirect(path: string);

    contentType(type: ContentType): RequestContext;

    cookie(options: CookieOptions): RequestContext;

    end(content?: object);
};