import { IRequestHandler, IRequestResult } from "../../../interfaces";
import { InterfaceRouteData } from "../../../types";

import Conf from "../../../utils/Configuration";
import RequestContext from "../RequestContext";
import Route from "./Route";

export default class InterfaceRoute extends Route implements InterfaceRouteData, IRequestHandler {
    constructor(options: InterfaceRouteData) {
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