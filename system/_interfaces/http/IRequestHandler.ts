import { RequestContext } from "../../_classes";

import IRequestResult from "./IRequestResult";

export default interface IRequestHandler {
    onRequest(req: RequestContext): Promise<IRequestResult>;
};