import { IRequestResult } from "../../../interfaces";

import RequestContext from "../RequestContext";

export default class BadRequestResult implements IRequestResult {
    constructor() { }

    execute(context: RequestContext) {
        context.status(400);
    }
};