import { randomUUID } from "crypto";

import { User, Session } from "../";
import { CookieOptions, CookieFlags, CookieSitePolicy } from "../../_types";

import Conf from "../../../utils/Configuration";
import Utils from "../../../utils/Toolbox";

const sessions: { [token: string]: Session } = {};

export default class AuthManager {
    static checkLogin(name: string, input: string) {
        const user = Conf.Security.DefaultUsers[name] ?? null;

        if (user !== null && user.passwd === input) {
            const token = Utils.random(Conf.Session.CookieLength, Conf.Session.SpecialCharacters);

            const date = new Date();
            date.setTime(+date + Conf.Session.ValidityTime);

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

    static getSession(input: string): Session {
        try {
            return sessions[Utils.sha256(input)] || new Session();
        }
        catch {
            return new Session();
        }
    }
};