import { IRequestHandler, IRequestResult } from "../../../interfaces";
import { QueryOptions, RouteData } from "../../../types";

import RequestContext from "../RequestContext";

export default class Route implements RouteData, IRequestHandler {
    constructor(options: RouteData) {
        this.path = options.path;
        this.body = options.body;
        this.query = options.query;
        this.requiresLogin = options.requiresLogin;
    }

    path: string;

    requiresLogin?: boolean;

    query?: QueryOptions[];

    body?: boolean;

    onRequest(context: RequestContext): Promise<IRequestResult> {
        return;
    }
};