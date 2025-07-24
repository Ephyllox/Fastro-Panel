import assert from "assert";

import { BypassTokenModel, UserModel } from "../../../../database/models";

import { AuthManager, BadRequestResult, InterfaceRoute, JsonResult, NoContentResult, RequestContext } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";
import { UserRole } from "../../../_types";

import Utils from "../../../../utils/Toolbox";

function validateRoles(roles: UserRole[]): boolean {
    return roles.every(role => UserRole[role] !== undefined);
}

export class UserInfo extends InterfaceRoute {
    constructor() {
        super({
            path: "users/identity",
            methods: ["GET"],
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const user = context.session!.user!;

        return new JsonResult({
            Username: user.name,
            UserId: user.id,
            SessionId: context.session!.id,
            MsaEnabled: user.msaEnabled,
            Permissions: user.roles?.map(
                item => UserRole[item] as string
            ),
        });
    }
};

export class UserList extends InterfaceRoute {
    constructor() {
        super({
            path: "users/list",
            methods: ["GET"],
            requiresLogin: true,
            requiredRoles: [UserRole.Administrator],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const user_array = await UserModel.findAll({ order: [["id", "ASC"]] });
        const mapped_users: object[] = [];

        user_array.forEach(item => mapped_users.push({
            Username: item.name,
            UserId: item.id,
            LastLoginDate: item.lastLogin,
            Disabled: item.disabled,
            Permissions: item.roles?.map(
                item => UserRole[item] as string
            ),
        }));

        return new JsonResult(mapped_users);
    }
};

type UserUpdateDetails = {
    user_id: number, blocked?: boolean, locations?: string[], roles?: UserRole[],
};

type UserDeletionDetails = {
    user_id: number, delete_user?: boolean, delete_locations?: boolean, remove_msa?: boolean,
};

export class UserUpdate extends InterfaceRoute {
    constructor() {
        super({
            path: "users/update",
            methods: ["PATCH", "DELETE"],
            body: true,
            requiresLogin: true,
            requiredRoles: [UserRole.Administrator],
        });
    }

    private async checkUser(userId: number, context: RequestContext): Promise<UserModel> {
        assert(userId !== undefined, "You must provide a user identifier.");

        const user = await UserModel.findOne({ where: { id: userId } });

        assert(user, "The specified user does not exist.");
        assert(user.id !== 1, "You cannot modify the initial user.");
        assert(user.id !== context.session!.userId, "You cannot modify your own account.");

        return user;
    }

    async PATCH(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as UserUpdateDetails;
        const user = await this.checkUser(data.user_id, context);

        if (data.locations) {
            const valid = data.locations.every(addr => user.knownLocations.includes(addr));
            assert(valid, "The whitelisted locations are invalid.");
            context._log(`${context.session!.user!.name} has updated ${user.name}'s login location whitelist`, "cyan", "audit");
        }

        if (data.roles) {
            data.roles = data.roles.map(role => Number(role));
            assert(validateRoles(data.roles), "The permission roles are invalid.");
            context._log(`${context.session!.user!.name} has updated ${user.name}'s roles`, "cyan", "audit");
        }

        if (data.blocked !== undefined && data.blocked !== user.disabled) {
            context._log(`${context.session!.user!.name} has ${data.blocked ? "blocked" : "unblocked"} ${user.name}`, "yellow", "audit");
        }

        await user.update({ disabled: data.blocked, whitelistedLocations: data.locations, roles: data.roles });
        return new NoContentResult();
    }

    async DELETE(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as UserDeletionDetails;
        const user = await this.checkUser(data.user_id, context);

        if (data.delete_user) {
            context._log(`${context.session!.user!.name} has deleted ${user.name}'s account`, "yellow", "audit");
            await AuthManager.removeUserSessions(data.user_id);
            await BypassTokenModel.destroy({ where: { userId: data.user_id } });
            await user.destroy();
        }
        else {
            if (data.delete_locations) {
                context._log(`${context.session!.user!.name} has cleared ${user.name}'s known locations`, "cyan", "audit");
                await user.update({ knownLocations: [], whitelistedLocations: [] });
            }
            else if (data.remove_msa) {
                context._log(`${context.session!.user!.name} has disabled verification for: ${user.name}`, "yellow", "audit");
                await AuthManager.disableMsa(user);
            }
        }

        return new NoContentResult();
    }
};

type UserCreationDetails = {
    username: string, password: string, password_confirm: string, roles: UserRole[],
};

export class UserCreate extends InterfaceRoute {
    constructor() {
        super({
            path: "users/create",
            methods: ["POST"],
            body: true,
            requiresLogin: true,
            requiredRoles: [UserRole.Administrator],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as UserCreationDetails;

        if (Object.values(data).length === 4) {
            data.username = data.username.trim();
            data.password = data.password.trim();
            data.roles = data.roles.map(role => Number(role));

            assert(data.username.length > 3, "The username is too short.");
            assert(data.username.length <= 16, "The username is too long.");
            assert(Utils.checkAlphanumeric(data.username), "The username can only contain letters and numbers.");
            assert(data.password.length >= 8, "The password is too short.");
            assert(data.password === data.password_confirm, "The passwords do not match.");
            assert(validateRoles(data.roles), "The permission roles are invalid.");
            assert(!(await UserModel.findOne({ where: { name: data.username } })), "That user already exists.");

            const user_index = Math.max(...(await UserModel.findAll()).map(
                item => item.id
            )) + 1;

            await UserModel.create({
                id: user_index,
                name: data.username,
                passwordHash: AuthManager.hashCredentials(data.password, data.username + user_index),
                roles: data.roles,
                knownLocations: [],
                whitelistedLocations: [],
                disabled: false,
                msaEnabled: false,
            });

            context._log(`${context.session!.user!.name} created a new user: ${data.username}`, "cyan", "audit");
            return new NoContentResult();
        }

        return new BadRequestResult("You must provide a username, password, and password confirmation.");
    }
};