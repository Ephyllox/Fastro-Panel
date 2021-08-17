import { randomUUID } from "crypto";
import { CookieFlags, UserRole } from "../../enums";
import { User, Session } from "..";
import { CookieOptions, UserLogin } from "../../types";
import Utils from "../../utils/library";

const sessions: Session[] = [];

const logins: { [name: string]: UserLogin } = {
    "admin": {
        id: 1,
        password: "asdasd",
        perms: {
            roles: [
                UserRole.ADMIN,
            ],
        },
    },
};

export default class AuthManager {
    static checkLogin(name, input) {
        if (logins[name]?.password === input) {
            const token = Utils.random(16);

            const date = new Date();
            date.setTime(+date + 54e6);

            const user = new User(name, logins[name]);
            sessions[token] = new Session(randomUUID(), user, date);

            return {
                name: "__|SITE::SECURITY",
                value: token,
                path: "/",
                expires: date,
                flags: [
                    CookieFlags.HTTPONLY,
                ],
            } as CookieOptions;
        }
        else {
            return;
        }
    }

    static getSession(input): Session {
        return sessions[input] || new Session(null, null, null);
    }
};