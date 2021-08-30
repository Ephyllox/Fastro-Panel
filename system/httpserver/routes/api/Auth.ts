import { AuthManager, BadRequestResult, InterfaceRoute, OkResult, RequestContext, UnauthorizedResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export class LoginAPI extends InterfaceRoute {
    constructor() {
        super({
            path: "validate-login",
            method: "POST",
            body: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        if (context.input.body["username"]) {
            const validation = AuthManager.checkLogin(context.input.body["username"], context.input.body["password"]);

            if (validation) {
                context.cookie(validation);
            }
            else {
                return new UnauthorizedResult("Incorrect credentials submitted.");
            }

            return new OkResult();
        }
        else {
            return new BadRequestResult("You must provide valid credentials.");
        }
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