import assert from "assert";

import { AuthManager, BadRequestResult, InterfaceRoute, NoContentResult, RequestContext, UnauthorizedResult } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";

import Conf from "../../../../utils/Configuration";
import Utils from "../../../../utils/Toolbox";

type LoginDetails = {
    username: string, password: string,
};

export class Login extends InterfaceRoute {
    constructor() {
        super({
            path: "auth/validate-login",
            methods: ["POST"],
            body: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as LoginDetails;

        if (data.username && data.password) {
            const validation = AuthManager.checkLogin(data.username, data.password);

            if (validation) {
                context.cookie(validation);
            }
            else {
                return new UnauthorizedResult("Please check your credentials.");
            }

            return new NoContentResult();
        }

        return new BadRequestResult("You must provide valid credentials.");
    }
};

export class Logout extends InterfaceRoute {
    constructor() {
        super({
            path: "auth/logout",
            methods: ["POST"],
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        context.session!.invalidate();
        return new NoContentResult();
    }
};

type SignupDetails = {
    username: string, password: string, password_confirm: string,
};

export class Register extends InterfaceRoute {
    constructor() {
        super({
            path: "auth/register",
            methods: ["POST"],
            body: true,
            //blocked: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as SignupDetails;

        if (Object.values(data).length === 3) {
            assert(data.username.length <= 16, "Your username is too long.");
            assert(Utils.checkAlphanumeric(data.username), "Your username can only contain letters and numbers.");
            assert(data.password === data.password_confirm, "The passwords do not match.");
            assert(!Conf.Security.DefaultUsers[data.username], "That user already exists.");

            const user_index = Math.max(...Object.values(Conf.Security.DefaultUsers).map(
                item => item.id
            )) + 1;

            Conf.Security.DefaultUsers[data.username] = {
                id: user_index,
                passwd: AuthManager.hashCredentials(data.password, data.username + user_index),
            };

            return new NoContentResult();
        }

        return new BadRequestResult("You must provide a username, password, and password confirmation.");
    }
};