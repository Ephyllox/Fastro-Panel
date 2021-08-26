import { IRequestHandler, IRequestResult } from "../../../interfaces";
import { PageRouteData } from "../../../types";

import RequestContext from "../RequestContext";

export default class DirectoryRoute implements PageRouteData, IRequestHandler {
    constructor(options: PageRouteData) {
        this.directory = options.directory;
        this.requiresLogin = options.requiresLogin;
        this.redirectIfAuthorized = options.redirectIfAuthorized;
    }

    directory: string;

    requiresLogin?: boolean;

    redirectIfAuthorized?: string;

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return;
    }
};