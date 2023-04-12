import { InterfaceRouteData, HttpMethod } from "../../../_types";

import Conf from "../../../../utils/Configuration";
import Route from "./Route";

export default class InterfaceRoute extends Route implements InterfaceRouteData {
    constructor(options: InterfaceRouteData) {
        super({
            path: Conf.Router.APIDirectory + options.path,
            requiresLogin: options.requiresLogin,
            requiredRoles: options.requiredRoles,
            blocked: options.blocked,
            body: options.body,
            query: options.query,
        });

        this.methods = options.methods;
    }

    methods: HttpMethod[];
};