import assert from "assert";

import { AuthManager, BadRequestResult, InterfaceRoute, JsonResult, OkResult, RequestContext } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";
import { UserRole } from "../../../_types";

import Conf from "../../../../utils/Configuration";

export class UserInfo extends InterfaceRoute {
    constructor() {
        super({
            path: "user/identity",
            methods: ["POST"],
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new JsonResult(context.session!.parse());
    }
};

export class UserList extends InterfaceRoute {
    constructor() {
        super({
            path: "user/list",
            methods: ["POST"],
            requiresLogin: true,
            requiredRoles: [UserRole.ADMIN],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const user_array = Object.entries(Conf.Security.DefaultUsers);
        const mapped_users: object[] = [];

        user_array.forEach(item => mapped_users.push({
            Name: item[0],
            UserId: item[1].id,
            Disabled: item[1].perms?.disabled ?? false,
            Permissions: item[1].perms?.roles.map(
                item => UserRole[item] as string
            )
        }));

        return new JsonResult(mapped_users);
    }
};

type UserDeletionDetails = {
    user_id: number,
};

export class UserUpdate extends InterfaceRoute {
    constructor() {
        super({
            path: "user/update",
            methods: ["DELETE"],
            body: true,
            requiresLogin: true,
            requiredRoles: [UserRole.ADMIN],
        });
    }

    async DELETE(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as UserDeletionDetails;

        if (data.user_id) {
            const username = Object.keys(Conf.Security.DefaultUsers).find(
                user => Conf.Security.DefaultUsers[user].id === data.user_id
            );

            assert(username !== undefined, "The specified user does not exist.");
            assert(Conf.Security.DefaultUsers[username].id !== 1, "You cannot delete the initial user.");

            AuthManager.getSessions(data.user_id).forEach(session => session.invalidate());
            delete Conf.Security.DefaultUsers[username];

            return new OkResult();
        }

        return new BadRequestResult("You must provide the user identifier.");
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        switch (context.method) {
            case "DELETE":
                return this.DELETE(context);
        }

        return new BadRequestResult();
    }
};