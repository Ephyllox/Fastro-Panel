import { RequestContext } from "../../classes";

import IRequestResult from "./IRequestResult";

export default interface IRequestHandler {
    onRequest(req: RequestContext): Promise<IRequestResult>;
};