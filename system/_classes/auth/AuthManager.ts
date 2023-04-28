import { randomUUID, pbkdf2Sync } from "crypto";

import { User, Session } from "../";
import { CookieOptions, CookieFlags, CookieSitePolicy, ValidationData } from "../../_types";

import Conf from "../../../utils/Configuration";
import Utils from "../../../utils/Toolbox";

const sessions: { [token: string]: Session } = {};

export default class AuthManager {
    static hashCredentials(passwd: string, salt: string) {
        return pbkdf2Sync(passwd, salt, 10000, 32, "sha256").toString("hex");
    }

    static checkLogin(name: string, passwd: string): ValidationData {
        const target = Conf.Security.DefaultUsers[name] ?? null;

        if (target !== null && this.hashCredentials(passwd, name + target.id) === target.passwd) {
            if (target.perms.disabled) return { success: false, blocked: true };

            const token = Utils.random(Conf.Session.CookieLength, Conf.Session.SpecialCharacters);

            const date = new Date();
            date.setTime(+date + Conf.Session.ValidityTime);

            const user = new User(name, Conf.Security.DefaultUsers[name]);
            sessions[Utils.sha256(token)] = new Session(randomUUID(), user, date);

            return {
                success: true,
                cookie: {
                    name: Conf.Session.CookieName,
                    value: token,
                    path: "/",
                    expires: date,
                    samesite: CookieSitePolicy.STRICT,
                    flags: [
                        CookieFlags.HTTPONLY,
                    ],
                },
            };
        }
        else {
            return { success: false };
        }
    }

    static getUserSession(token: string): Session | undefined {
        try {
            return sessions[Utils.sha256(token)];
        }
        catch {
            return;
        }
    }

    static getUserSessions(user_id: number): Session[] {
        return this.getAllSessions().filter(session => session.user.id === user_id);
    }

    static getAllSessions(): Session[] {
        // Return only valid sessions
        return Object.values(sessions).filter(session => session.isValid());
    }

    static getSessionById(session_id: string): Session | undefined {
        return this.getAllSessions().find(session => session.id === session_id);
    }
};