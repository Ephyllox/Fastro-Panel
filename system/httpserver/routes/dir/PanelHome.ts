import { DirectoryRoute, RequestContext, ViewResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export default class PanelHomeDir extends DirectoryRoute {
    constructor() {
        super({
            path: "/panel",
            directory: "pages/panel.html",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory);
    }
};