"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(name, data) {
        this.name = name;
        this.id = data === null || data === void 0 ? void 0 : data.id;
        this.perms = data === null || data === void 0 ? void 0 : data.perms;
    }
}
exports.default = User;
;
