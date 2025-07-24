import { UserModel } from "../../../../database/models";

import { AuthorizationError, BadRequestResult, DirectoryRoute, RequestContext, ViewResult } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";
import { UserRole } from "../../../_types";

function getAccessTemplate(context: RequestContext): object {
    return {
        nav_mgmt_access: new Management().isUserAuthorized(context),
    };
}

export class Home extends DirectoryRoute {
    constructor() {
        super({
            path: "/panel",
            directory: "pages/panel.html",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory, getAccessTemplate(context));
    }
};

export class Updates extends DirectoryRoute {
    constructor() {
        super({
            path: "/updates",
            directory: "pages/updates.html",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory, getAccessTemplate(context));
    }
};

export class Management extends DirectoryRoute {
    constructor() {
        super({
            path: "/management",
            directory: "pages/management.html",
            requiresLogin: true,
            requiredRoles: [UserRole["Session Manager"], UserRole["Settings Manager"]],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory, getAccessTemplate(context));
    }
};

export class CreateAccount extends DirectoryRoute {
    constructor() {
        super({
            path: "/create-account",
            directory: "pages/login/register.html",
            requiresLogin: true,
            requiredRoles: [UserRole.Administrator],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const roles = Object.keys(UserRole).filter((v) => isNaN(Number(v)));

        return new ViewResult(this.directory, {
            available_roles: roles.map((role, index) => {
                return {
                    role: index,
                    display_name: role,
                    selected: index === 0 ? "selected" : null,
                };
            }),
        });
    }
};

export class ManageAccount extends DirectoryRoute {
    constructor() {
        super({
            path: "/manage-account",
            directory: "pages/login/manage.html",
            requiresLogin: true,
            requiredRoles: [UserRole.Administrator],
            query: [
                { name: "id", required: true },
            ],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        // TODO: Fix error when the input type is not a number
        const user = await UserModel.findOne({ where: { id: context.input.query.id } });
        if (!user) return new BadRequestResult("The specified user does not exist.");

        if (user.id === 1 || user.id === context.session!.userId) {
            throw new AuthorizationError();
        }

        const roles = Object.keys(UserRole).filter((v) => isNaN(Number(v)));

        return new ViewResult(this.directory, {
            target_user: user.name,
            msa_enabled: user.msaEnabled,
            known_locations: user.knownLocations.map((addr) => {
                return {
                    address: addr,
                    selected: user.whitelistedLocations.includes(addr) ? "selected" : null,
                };
            }),
            available_roles: roles.map((role, index) => {
                return {
                    role: index,
                    display_name: role,
                    selected: user.roles.includes(index) ? "selected" : null,
                };
            }),
        });
    }
};