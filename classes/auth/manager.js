"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const enums_1 = require("../../enums");
const __1 = require("..");
const library_1 = require("../../utils/library");
const sessions = [];
const logins = {
    "admin": {
        id: 1,
        password: "asdasd",
        perms: {
            roles: [
                enums_1.UserRole.ADMIN,
            ],
        },
    },
};
class AuthManager {
    static checkLogin(name, input) {
        var _a;
        if (((_a = logins[name]) === null || _a === void 0 ? void 0 : _a.password) === input) {
            const token = library_1.default.random(16);
            const date = new Date();
            date.setTime(+date + 54e6);
            const user = new __1.User(name, logins[name]);
            sessions[token] = new __1.Session(crypto_1.randomUUID(), user, date);
            return {
                name: "__|SITE::SECURITY",
                value: token,
                path: "/",
                expires: date,
                flags: [
                    enums_1.CookieFlags.HTTPONLY,
                ],
            };
        }
        else {
            return;
        }
    }
    static getSession(input) {
        return sessions[input] || new __1.Session(null, null, null);
    }
}
exports.default = AuthManager;
;
