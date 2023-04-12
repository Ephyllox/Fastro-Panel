export type UserLogin = {
    id: number;

    passwd: string;

    perms?: UserPerms;
};

export type UserPerms = {
    roles: UserRole[];

    disabled?: boolean;
};

export enum UserRole {
    ADMIN,
    DEFAULT,
};