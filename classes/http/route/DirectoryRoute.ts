import { PageRouteData } from "../../../types";

export default class DirectoryRoute implements PageRouteData {
    constructor(options: PageRouteData) {
        this.directory = options.directory;
        this.requiresLogin = options.requiresLogin;
        this.redirectIfAuthorized = options.redirectIfAuthorized;
        this.systemRouted = options.systemRouted;
    }

    directory: string;

    requiresLogin?: boolean;

    redirectIfAuthorized?: string;

    systemRouted?: boolean;
};