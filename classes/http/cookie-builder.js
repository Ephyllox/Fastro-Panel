"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../../enums");
class CookieBuilder {
    constructor(options) {
        this.name = options.name;
        this.value = options.value;
        this.expires = options.expires;
        this.path = options.path;
        this.flags = options.flags;
    }
    parse() {
        let built = `${this.name}=${this.value};`;
        if (this.expires)
            built += `expires=${this.expires.toUTCString()};`;
        if (this.path)
            built += `path=${this.path};`;
        if (this.flags) {
            built += `${this.flags.map(item => `${enums_1.CookieFlags[item].toLowerCase()}; `)}`;
        }
        return built;
    }
}
exports.default = CookieBuilder;
;
