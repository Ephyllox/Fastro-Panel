import { CookieFlags } from "../../enums";
import { CookieOptions } from "../../types";

export default class CookieBuilder {
    constructor(options: CookieOptions) {
        this.name = options.name;
        this.value = options.value;
        this.expires = options.expires;
        this.path = options.path;
        this.flags = options.flags;
    }

    name: string;

    value: string;

    path: string;

    expires?: Date;

    flags?: CookieFlags[];

    parse() {
        let built = `${this.name}=${this.value};`;

        if (this.expires) built += `expires=${this.expires.toUTCString()};`;
        if (this.path) built += `path=${this.path};`;

        if (this.flags) {
            built += `${this.flags.map(
                item => `${CookieFlags[item].toLowerCase()}; `
            )}`;
        }

        return built;
    }
};