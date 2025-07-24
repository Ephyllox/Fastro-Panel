import { CookieOptions } from "../http/CookieOptions";

export type ValidationData = {
    success: boolean;

    msa?: boolean;

    blocked?: boolean;

    restricted?: boolean;

    cookie?: CookieOptions;
};