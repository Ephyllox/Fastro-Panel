import { CookieOptions, CookieFlags, CookieSitePolicy } from "../../_types";

export default class CookieBuilder {
    constructor(options: CookieOptions) {
        this.name = options.name;
        this.value = options.value;
        this.expires = options.expires;
        this.domain = options.domain;
        this.path = options.path;
        this.samesite = options.samesite;
        this.flags = options.flags;
    }

    name: string;

    value: string;

    domain: string;

    path: string;

    expires?: Date;

    samesite?: CookieSitePolicy;

    flags?: CookieFlags[];

    parse() {
        let built = `${this.name}=${this.value};`;

        if (this.expires) built += `expires=${this.expires.toUTCString()};`;
        if (this.domain) built += `domain=${this.domain};`;
        if (this.path) built += `path=${this.path};`;

        if (this.flags) {
            built += `${this.flags.map(
                item => `${CookieFlags[item].toLowerCase()}; `
            )}`;
        }

        if (this.samesite !== undefined) built += `samesite=${CookieSitePolicy[this.samesite].toLowerCase()};`;
        return built;
    }
};