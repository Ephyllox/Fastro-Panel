import { DirectoryRoute, RequestContext, ViewResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export default class PanelUpdatesDir extends DirectoryRoute {
    constructor() {
        super({
            path: "/updates",
            directory: "pages/updates.html",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory);
    }
};