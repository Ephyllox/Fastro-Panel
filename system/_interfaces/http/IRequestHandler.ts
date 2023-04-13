import { RequestContext } from "../../_classes";

import IRequestResult from "./IRequestResult";

export default interface IRequestHandler {
    isUserAuthorized(req: RequestContext): boolean;

    onRequest(req: RequestContext): Promise<IRequestResult>;
};