import { DirectoryRoute, RequestContext, ViewResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export default class PanelUpdatesDir extends DirectoryRoute {
    constructor() {
        super({
            directory: "/updates",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult("pages/updates.html");
    }
};