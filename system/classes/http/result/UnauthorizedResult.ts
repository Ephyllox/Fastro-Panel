import { IRequestResult } from "../../../interfaces";

import RequestContext from "../RequestContext";

export default class UnauthorizedResult implements IRequestResult {
    constructor() { }

    execute(context: RequestContext) {
        context.status(401);
    }
};