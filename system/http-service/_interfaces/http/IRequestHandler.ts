import { RequestContext } from "../../_classes";

import IRequestResult from "./IRequestResult";

export default interface IRequestHandler { //eslint-disable-line
    onRequest(req: RequestContext): Promise<IRequestResult>;
};