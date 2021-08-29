import { DirectoryRoute, RequestContext, ViewResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

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