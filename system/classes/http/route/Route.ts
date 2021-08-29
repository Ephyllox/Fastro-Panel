import { RouteData } from "../../../types";

export default class Route implements RouteData {
    constructor(options: RouteData) {
        this.path = options.path;
        this.requiresLogin = options.requiresLogin;
    }

    path: string;

    requiresLogin?: boolean;
};