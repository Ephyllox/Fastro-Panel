import assert from "assert";

import { AuthManager, BadRequestResult, InterfaceRoute, JsonResult, NoContentResult, RequestContext } from "../../../_classes";
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
            Username: item[0],
            UserId: item[1].id,
            Disabled: item[1].perms.disabled,
            Permissions: item[1].perms.roles?.map(
                item => UserRole[item] as string
            )
        }));

        return new JsonResult(mapped_users);
    }
};

type UserBlockDetails = {
    user_id: number, blocked: boolean,
};

type UserDeletionDetails = {
    user_id: number,
};

export class UserUpdate extends InterfaceRoute {
    constructor() {
        super({
            path: "user/update",
            methods: ["PATCH", "DELETE"],
            body: true,
            requiresLogin: true,
            requiredRoles: [UserRole.ADMIN],
        });
    }

    private checkUser(userId: number) {
        assert(userId !== undefined, "You must provide a user identifier.");

        const username = Object.keys(Conf.Security.DefaultUsers).find(
            user => Conf.Security.DefaultUsers[user].id === userId
        );

        assert(username !== undefined, "The specified user does not exist.");
        assert(Conf.Security.DefaultUsers[username].id !== 1, "You cannot modify the initial user.");
        return username;
    }

    async PATCH(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as UserBlockDetails;
        const username = this.checkUser(data.user_id);

        Conf.Security.DefaultUsers[username].perms.disabled = data.blocked;

        return new NoContentResult();
    }

    async DELETE(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as UserDeletionDetails;
        const username = this.checkUser(data.user_id);

        AuthManager.getUserSessions(data.user_id).forEach(session => session.invalidate());
        delete Conf.Security.DefaultUsers[username];

        return new NoContentResult();
    }
};