import { IRequestResult } from "../../../_interfaces";

import RequestContext from "../RequestContext";

export default class RedirectResult implements IRequestResult {
    constructor(path: string) {
        this.path = path;
    }

    path: string;

    execute(context: RequestContext) {
        context.redirect(this.path);
    }
};