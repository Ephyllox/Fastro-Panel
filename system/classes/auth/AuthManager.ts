import { randomUUID } from "crypto";

import { User, Session } from "../";
import { CookieOptions, CookieFlags } from "../../types";

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