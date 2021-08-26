import { DirectoryRoute, RequestContext, ViewResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export default class PanelHomeDir extends DirectoryRoute {
    constructor() {
        super({
            directory: "/panel",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult("pages/panel.html");
    }
};