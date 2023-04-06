import { IRequestHandler, IRequestResult } from "../../../_interfaces";
import { QueryOptions, RouteData } from "../../../_types";
import { OkResult } from "../result/status/2xxResult";

import RequestContext from "../RequestContext";

export default class Route implements RouteData, IRequestHandler {
    constructor(options: RouteData) {
        this.path = options.path;
        this.body = options.body;
        this.query = options.query;
        this.requiresLogin = options.requiresLogin;
        this.blocked = options.blocked;
    }

    path: string;

    requiresLogin?: boolean;

    blocked?: boolean;

    query?: QueryOptions[];

    body?: boolean;

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new OkResult();
    }
};