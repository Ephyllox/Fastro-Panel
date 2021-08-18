export type CookieOptions = {
    name: string;

    value: string;

    path: string;

    expires?: Date;

    flags?: CookieFlags[];
};

export enum CookieFlags {
    HTTPONLY,
    SECURE,
};