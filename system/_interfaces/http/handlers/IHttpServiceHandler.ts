import { RequestContext } from "../../../_classes";

import HTTPServer from "../../../../server";

export default interface IHttpServiceHandler {
    base: HTTPServer;

    process(context: RequestContext, url: string): Promise<void>;
};