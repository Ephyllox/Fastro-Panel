import { RequestContext } from "../../../_classes";

import HTTPServer from "../../../../../server";

export default interface IHttpServiceHandler { //eslint-disable-line
    base: HTTPServer;

    process(context: RequestContext, url: string): Promise<void>;
};