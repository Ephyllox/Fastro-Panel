import { randomUUID, pbkdf2Sync } from "crypto";

import { User, Session } from "../";
import { CookieOptions, CookieFlags, CookieSitePolicy, UserLogin } from "../../_types";

import Conf from "../../../utils/Configuration";
import Utils from "../../../utils/Toolbox";

const sessions: { [token: string]: Session } = {};

export default class AuthManager {
    static hashCredentials(passwd: string, salt: string) {
        return pbkdf2Sync(passwd, salt, 10000, 32, "sha256").toString("hex");
    }

    static checkLogin(name: string, passwd: string) {
        const user = Conf.Security.DefaultUsers[name] ?? null;

        if (user !== null && this.hashCredentials(passwd, name + user.id) === user.passwd) {
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

    static getSession(token: string): Session | undefined {
        try {
            return sessions[Utils.sha256(token)];
        }
        catch {
            return;
        }
    }

    static getSessions(user_id: number): Session[] {
        return Object.values(sessions).filter(session => session.user.id === user_id);
    }
};