import { IRequestHandler, IRequestResult } from "../../../interfaces";
import { APIRouteData } from "../../../types";

import RequestContext from "../RequestContext";

export default class InterfaceRoute implements APIRouteData, IRequestHandler {
    constructor(options: APIRouteData) {
        this.method = options.method;
        this.endpoint = `/api/${options.endpoint}`;
        this.requiresLogin = options.requiresLogin;
    }

    method: string;

    endpoint: string;

    requiresLogin?: boolean;

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return;
    }
};