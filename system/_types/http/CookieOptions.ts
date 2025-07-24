export type CookieOptions = {
    name: string;

    value: string;

    path: string;

    domain?: string;

    expires?: Date;

    samesite?: CookieSitePolicy;

    flags?: CookieFlags[];
};

export enum CookieFlags {
    HttpOnly,
    Secure,
};

export enum CookieSitePolicy {
    Strict,
    Lax,
};