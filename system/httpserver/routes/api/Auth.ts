import { AuthManager, BadRequestResult, InterfaceRoute, OkResult, RequestContext, UnauthorizedResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export class LoginAPI extends InterfaceRoute {
    constructor() {
        super({
            path: "validate-login",
            method: "POST",
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        if (context.req.headers["username"]) {
            const validation = AuthManager.checkLogin(context.req.headers["username"], context.req.headers["password"]);

            if (validation) {
                context.cookie(validation);
            }
            else {
                return new UnauthorizedResult("Incorrect credentials submitted.");
            }
        }
        else {
            return new BadRequestResult("You must enter valid credentials.");
        }

        return new OkResult();
    }
};

export class LogoutAPI extends InterfaceRoute {
    constructor() {
        super({
            path: "logout",
            method: "POST",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        context.session.invalidate();
        return new OkResult();
    }
};