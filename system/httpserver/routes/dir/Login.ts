import { DirectoryRoute, RequestContext, ViewResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export default class LoginDir extends DirectoryRoute {
    constructor() {
        super({
            directory: "/login",
            redirectIfAuthorized: "panel",
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult("pages/login.html");
    }
};