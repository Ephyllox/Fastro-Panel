export type CookieOptions = {
    name: string;

    value: string;

    domain: string;

    path: string;

    expires?: Date;

    samesite?: CookieSitePolicy;

    flags?: CookieFlags[];
};

export enum CookieFlags {
    HTTPONLY,
    SECURE,
};

export enum CookieSitePolicy {
    STRICT,
    LAX,
};