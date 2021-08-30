import { RequestContext } from "../../../classes";

import HTTPServer from "../../../../server";

export default interface IServiceHandler { //eslint-disable-line
    base: HTTPServer;

    process(context: RequestContext, url: string): Promise<void>;
};