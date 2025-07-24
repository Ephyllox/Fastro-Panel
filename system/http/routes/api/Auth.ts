import assert from "assert";

import { AuthManager, BadRequestResult, ForbiddenResult, InterfaceRoute, JsonResult, NoContentResult, RequestContext, UnauthorizedResult } from "../../../_classes";
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
            ratelimit: {
                maxRequests: 3,
                timeout: 3e4,
                preserveRate: false,
                message: "Too many login attempts, try again later.",
            },
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as LoginDetails;

        if (data.username && data.password) {
            const bypassToken = Utils.getCookies(context.req)[Conf.Security.MSA.CookieName];
            const result = await AuthManager.checkLogin(data.username, data.password, bypassToken, context.remoteAddress);

            if (result.success) {
                context._log(`Successful login - user: ${data.username}, from: ${context.remoteAddress}`, "cyan", "security");
                context.cookie(result.cookie!);

                return new JsonResult({
                    Success: result.success,
                    IncompleteLogin: result.msa,
                });
            }
            else if (result.blocked) {
                context._log(`Login rejected - user: ${data.username}, from: ${context.remoteAddress}`, "yellow", "security");
                return new ForbiddenResult("Your account is blocked.");
            }
            else if (result.restricted) {
                context._log(`Login location rejected - user: ${data.username}, from: ${context.remoteAddress}`, "yellow", "security");
                return new ForbiddenResult("You currently cannot log in from this location.");
            }

            context._log(`Login failure - user: ${data.username}, from: ${context.remoteAddress}`, "yellow", "security");
            return new UnauthorizedResult("Please check your credentials.");
        }

        return new BadRequestResult("You must provide valid credentials.");
    }
};

type VerificationDetails = {
    code: string, temporary_bypass?: boolean,
};

export class Verification extends InterfaceRoute {
    constructor() {
        super({
            path: "auth/validate-login/msa",
            methods: ["POST"],
            body: true,
            requiresLogin: true,
            accessibleDuringMsa: true,
            ratelimit: {
                maxRequests: 6,
                timeout: 3e4,
                preserveRate: false,
                message: "Too many verification attempts, try again later.",
            },
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as VerificationDetails;

        assert(context.session!.pendingMsa, "The session does not require verification.");

        if (data.code) {
            const user = context.session!.user!;
            const result = await AuthManager.verifyMsaCode(user, data.code);

            if (result) {
                context._log(`Successful verification - user: ${user.name}, device bypass: ${data.temporary_bypass}, from: ${context.remoteAddress}`, "cyan", "security");

                await context.session!.update({
                    pendingMsa: false,
                    claimedMsaToken: data.code,
                    expiry: new Date(+new Date() + Conf.Session.ValidityTime),
                });

                if (data.temporary_bypass) context.cookie(await AuthManager.createBypassToken(user));
                return new NoContentResult();
            }

            context._log(`Verification failure - user: ${user.name}, from: ${context.remoteAddress}`, "yellow", "security");
            return new UnauthorizedResult("The verification code is incorrect.");
        }

        return new BadRequestResult("You must provide a valid verification code.");
    }
};

type VerificationSetupDetails = {
    code?: string,
};

export class VerificationSetup extends InterfaceRoute {
    constructor() {
        super({
            path: "auth/msa/setup",
            methods: ["POST"],
            body: true,
            requiresLogin: true,
            ratelimit: {
                maxRequests: 10,
                timeout: 2e4,
                message: "Please wait before setting up verification again.",
            },
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as VerificationSetupDetails;
        const user = context.session!.user!;

        assert(!user.msaEnabled, "Verification is already enabled.");

        // If no code is provided, we perform the initial setup
        if (!data.code) {
            const code = await AuthManager.setupMsa(user);

            return new JsonResult({
                Secret: code.secret,
                QRCode: code.qrcode,
            });
        }

        if (await AuthManager.verifyMsaCode(context.session!.user!, data.code)) {
            context._log(`${user.name} has enabled verification`, "cyan", "security");
            await user.update({ msaEnabled: true });
            return new NoContentResult();
        }
        else {
            return new BadRequestResult("The verification code is incorrect.");
        }
    }
};

type VerificationRemovalDetails = {
    current_password: string,
};

export class VerificationRemoval extends InterfaceRoute {
    constructor() {
        super({
            path: "auth/msa/remove",
            methods: ["DELETE"],
            body: true,
            requiresLogin: true,
            ratelimit: {
                maxRequests: 5,
                timeout: 15000,
                message: "Too many removal attempts, try again later.",
            },
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as VerificationRemovalDetails;
        const user = context.session!.user!;

        assert(user.msaEnabled, "Verification is not enabled.");
        assert(data.current_password, "You must provide your current password.");

        if (!AuthManager.verifyCredentials(user, data.current_password)) {
            return new UnauthorizedResult("Your current password is incorrect.");
        }

        context._log(`${user.name} has disabled verification`, "cyan", "security");
        await AuthManager.disableMsa(user);
        return new NoContentResult();
    }
};

type ChangePasswordDetails = {
    current_password: string, new_password: string, new_password_confirm: string,
};

export class ChangePassword extends InterfaceRoute {
    constructor() {
        super({
            path: "auth/change-password",
            methods: ["PATCH"],
            body: true,
            requiresLogin: true,
            ratelimit: {
                maxRequests: 5,
                timeout: 15000,
                message: "Too many change attempts, try again later.",
            },
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as ChangePasswordDetails;

        if (Object.values(data).length === 3) {
            data.new_password = data.new_password.trim();

            assert(data.new_password, "You must provide a new password.");
            assert(data.new_password.length >= 8, "Your new password is too short.");
            assert(data.new_password === data.new_password_confirm, "The passwords do not match.");

            const user = context.session!.user!;

            if (!AuthManager.verifyCredentials(user, data.current_password)) {
                return new UnauthorizedResult("Your current password is incorrect.");
            }

            context._log(`${user.name} has requested a password change`, "cyan", "security");

            await user.update({
                passwordHash: AuthManager.hashCredentials(data.new_password, user.name + user.id),
            });

            await AuthManager.removeUserSessions(user.id);
            return new NoContentResult();
        }

        return new BadRequestResult("You must provide your current password, new password, and new password confirmation.");
    }
};

export class Logout extends InterfaceRoute {
    constructor() {
        super({
            path: "auth/logout",
            methods: ["POST"],
            requiresLogin: true,
            accessibleDuringMsa: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        await context.session!.destroy();
        return new NoContentResult();
    }
};