import { DirectoryRoute, RedirectParameters } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";

import RequestContext from "../RequestContext";

export default class RedirectResult implements IRequestResult {
    constructor(route: new () => DirectoryRoute, params?: RedirectParameters) {
        this.path = new route().path;
        this.params = params;
    }

    path: string;

    params?: RedirectParameters;

    execute(context: RequestContext): void {
        context.redirect(this.path, this.params);
    }
};