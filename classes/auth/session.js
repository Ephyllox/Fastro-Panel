"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../../enums");
class Session {
    constructor(id, user, expiry) {
        this.id = id;
        this.user = user;
        this.expiry = expiry;
    }
    isValid() {
        return !this.invalid && this.expiry > new Date(Date.now());
    }
    invalidate() {
        this.invalid = true;
    }
    toJSON() {
        var _a;
        return JSON.stringify({
            Name: this.user.name,
            UserID: this.user.id,
            SessionID: this.id,
            Permissions: (_a = this.user.perms) === null || _a === void 0 ? void 0 : _a.roles.map(item => enums_1.UserRole[item].toString()),
        });
    }
}
exports.default = Session;
;
