import { RequestContext } from "../../classes";

import IRequestResult from "./IRequestResult";

export default interface RequestHandler {
    onRequest(req: RequestContext): Promise<IRequestResult>;
};