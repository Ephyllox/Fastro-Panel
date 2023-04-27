import { CookieOptions } from "../http/CookieOptions";

export type ValidationData = {
    success: boolean;

    blocked?: boolean;

    cookie?: CookieOptions;
};