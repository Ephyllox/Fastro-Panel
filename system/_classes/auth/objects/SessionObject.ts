import { UserRole } from "../../../_types";

import User from "./UserObject";

export default class Session {
    constructor(id: string, user: User, expiry: Date) {
        this.id = id;
        this.user = user;
        this.creation = new Date(Date.now());
        this.expiry = expiry;
    }

    public id: string;

    public user: User;

    public creation: Date;

    public expiry: Date;

    public invalid: boolean = false;

    public isValid() {
        return !this.invalid && this.expiry > new Date(Date.now());
    }

    public invalidate() {
        this.invalid = true;
    }

    public parse() {
        return {
            Username: this.user.name,
            UserId: this.user.id,
            SessionId: this.id,
            Permissions: this.user.perms.roles?.map(
                item => UserRole[item] as string
            ),
        };
    }
};