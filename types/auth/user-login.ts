import { UserPerms } from "./user-perms";

export type UserLogin = {
    id: number;

    password: string;

    perms?: UserPerms;
};