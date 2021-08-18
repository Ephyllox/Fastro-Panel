import { randomUUID } from "crypto";

import { CookieFlags } from "../../enums";
import { User, Session } from "..";
import { CookieOptions } from "../../types";

import Logins from "../../utils/security/UserLogins";
import Utils from "../../utils/Toolbox";

const sessions: Session[] = [];

export default class AuthManager {
    static checkLogin(name, input) {
        if (Logins[name]?.password === input) {
            const token = Utils.random(256);

            const date = new Date();
            date.setTime(+date + 54e6);

            const user = new User(name, Logins[name]);
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