import { UserLogin, UserPerms } from "../../../types";

export default class User {
    constructor(name: string, data: UserLogin) {
        this.name = name;
        this.id = data?.id;
        this.perms = data?.perms;
    }

    public id: number;

    public name: string;

    public perms?: UserPerms;
};