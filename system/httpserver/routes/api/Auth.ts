import { AuthManager, BadRequestResult, InterfaceRoute, OkResult, RequestContext, UnauthorizedResult } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export class LoginAPI extends InterfaceRoute {
    constructor() {
        super({
            endpoint: "validate-login",
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
                return new UnauthorizedResult();
            }
        }
        else {
            return new BadRequestResult();
        }

        return new OkResult();
    }
};

export class LogoutAPI extends InterfaceRoute {
    constructor() {
        super({
            endpoint: "logout",
            method: "POST",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        context.session.invalidate();
        return new OkResult();
    }
};