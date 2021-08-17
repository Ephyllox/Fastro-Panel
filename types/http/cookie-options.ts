import { CookieFlags } from "../../enums";

export type CookieOptions = {
    name: string;

    value: string;

    path: string;

    expires?: Date;

    flags?: CookieFlags[];
};