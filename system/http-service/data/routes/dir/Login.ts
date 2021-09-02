import { DirectoryRoute, RequestContext, ViewResult } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";

export default class LoginDir extends DirectoryRoute {
    constructor() {
        super({
            path: "/login",
            directory: "pages/login.html",
            redirectIfAuthorized: "/panel",
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory);
    }
};