import { IRequestHandler, IRequestResult } from "../../../interfaces";
import { PageRouteData } from "../../../types";

import RequestContext from "../RequestContext";
import Route from "./Route";

export default class DirectoryRoute extends Route implements PageRouteData, IRequestHandler {
    constructor(options: PageRouteData) {
        super({
            path: options.path,
            requiresLogin: options.requiresLogin,
        });

        this.directory = options.directory;
        this.redirectIfAuthorized = options.redirectIfAuthorized;
    }

    directory: string;

    redirectIfAuthorized?: string;

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return;
    }
};