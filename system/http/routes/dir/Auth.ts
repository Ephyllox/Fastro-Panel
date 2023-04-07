import { DirectoryRoute, RequestContext, ViewResult } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";

export class Login extends DirectoryRoute {
    constructor() {
        super({
            path: "/login",
            directory: "pages/login/login.html",
            redirectIfAuthorized: "/panel",
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory);
    }
};

export class Register extends DirectoryRoute {
    constructor() {
        super({
            path: "/login/register",
            directory: "pages/login/register.html",
            blocked: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory);
    }
};