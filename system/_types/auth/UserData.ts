export type UserLogin = {
    id: number;

    passwd: string;

    perms: UserPerms;
};

export type UserPerms = {
    disabled: boolean;

    roles?: UserRole[];
};

export enum UserRole {
    ADMIN,
    DEFAULT,
};