import { randomUUID } from "crypto";

import { User, Session } from "../";
import { CookieOptions, CookieFlags, CookieSitePolicy } from "../../types";

import Conf from "../../utils/Configuration";
import Utils from "../../utils/Toolbox";

const sessions: Session[] = [];

export default class AuthManager {
    static checkLogin(name, input) {
        if (Conf.Security.DefaultUsers[name]?.password === input) {
            const token = Utils.random(256);

            const date = new Date();
            date.setTime(+date + 54e6);

            const user = new User(name, Conf.Security.DefaultUsers[name]);
            sessions[Utils.sha256(token)] = new Session(randomUUID(), user, date);

            return {
                name: Conf.Session.CookieName,
                value: token,
                path: "/",
                expires: date,
                samesite: CookieSitePolicy.STRICT,
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
        try {
            return sessions[Utils.sha256(input)] || new Session();
        }
        catch {
            return new Session();
        }
    }
};