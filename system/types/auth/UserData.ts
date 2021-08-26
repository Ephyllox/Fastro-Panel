export type UserLogin = {
    id: number;

    password: string;

    perms?: UserPerms;
};

export type UserPerms = {
    roles: UserRole[];

    disabled?: boolean;
};

export enum UserRole {
    SUPER,
    USER,
};