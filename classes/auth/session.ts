import { UserRole } from "../../enums";
import User from "./user";

export default class Session {
    constructor(id: string, user: User, expiry: Date) {
        this.id = id;
        this.user = user;
        this.expiry = expiry;
    }

    public id: string;

    public user: User;

    public expiry: Date;

    public invalid: boolean;

    public isValid() {
        return !this.invalid && this.expiry > new Date(Date.now());
    }

    public invalidate() {
        this.invalid = true;
    }

    public toJSON() {
        return JSON.stringify({
            Name: this.user.name,
            UserID: this.user.id,
            SessionID: this.id,
            Permissions: this.user.perms?.roles.map(
                item => UserRole[item].toString()
            ),
        });
    }
};