import { IRequestHandler, IRequestResult } from "../../../interfaces";
import { APIRouteData } from "../../../types";

import RequestContext from "../RequestContext";
import Route from "./Route";

import Conf from "../../../utils/Configuration";

export default class InterfaceRoute extends Route implements APIRouteData, IRequestHandler {
    constructor(options: APIRouteData) {
        super({
            path: Conf.Router.APIDirectory + options.path,
            requiresLogin: options.requiresLogin,
        });

        this.method = options.method;
    }

    method: string;

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return;
    }
};