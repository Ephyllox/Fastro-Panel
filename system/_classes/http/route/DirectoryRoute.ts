import { DirectoryRouteData } from "../../../_types";

import Conf from "../../../utils/Configuration";
import Route from "./Route";

export default class DirectoryRoute extends Route implements DirectoryRouteData {
    constructor(options: DirectoryRouteData) {
        super({
            path: options.path,
            requiresLogin: options.requiresLogin,
            body: options.body,
            query: options.query,
        });

        this.directory = Conf.Static.Integrated.FileDirectory + options.directory;
        this.redirectIfAuthorized = options.redirectIfAuthorized;
    }

    directory: string;

    redirectIfAuthorized?: string;
};