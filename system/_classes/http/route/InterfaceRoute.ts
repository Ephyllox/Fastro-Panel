import { InterfaceRouteData } from "../../../_types";

import Conf from "../../../../utils/Configuration";
import Route from "./Route";

export default class InterfaceRoute extends Route implements InterfaceRouteData {
    constructor(options: InterfaceRouteData) {
        super({
            path: Conf.Router.APIDirectory + options.path,
            requiresLogin: options.requiresLogin,
            blocked: options.blocked,
            body: options.body,
            query: options.query,
        });

        this.method = options.method;
    }

    method: string;
};