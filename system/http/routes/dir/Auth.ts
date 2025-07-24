import { DirectoryRoute, RedirectResult, RequestContext, ViewResult } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";

export class Login extends DirectoryRoute {
    constructor() {
        super({
            path: "/login",
            directory: "pages/login/login.html",
            accessibleDuringMsa: true,
            redirectIfAuthorized: "/panel",
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        if (context.session?.pendingMsa) return new RedirectResult(Verification);
        return new ViewResult(this.directory);
    }
};

export class Verification extends DirectoryRoute {
    constructor() {
        super({
            path: "/login/verification",
            directory: "pages/login/verification.html",
            requiresLogin: true,
            accessibleDuringMsa: true,
            redirectIfAuthorized: "/panel",
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory, {
            username: context.session!.user!.name,
        });
    }
};