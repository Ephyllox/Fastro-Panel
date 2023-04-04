import * as FS from "fs";
import * as Crypto from "crypto";

import { IncomingMessage } from "http";

export default abstract class Toolbox {
    static sha256(input: string) {
        return Crypto.createHash("sha256").update(input).digest("hex");
    }

    static random(length: number, special = true) {
        const characters = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789${special ? "!@#$%()_+-/~\\" : ""}`, charactersLength = characters.length;
        let result = "";

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    static nonce() {
        const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-", charactersLength = characters.length;
        let result = "";

        for (let i = 0; i < 18; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    static getCookies(request: IncomingMessage) {
        const cookies: { [key: string]: string } = {};

        if (!request.headers.cookie) return cookies;

        request.headers.cookie.split(";").forEach(function (cookie) {
            const parts = cookie.match(/(.*?)=(.*)$/) || [];
            cookies[parts[1].trim()] = (parts[2] ?? "").trim();
        });

        return cookies;
    }

    static readFile(path: string, root: string = "system") {
        return new Promise<string>((resolve, reject) => {
            FS.readFile(`${root}/${path}`, "utf8", function (error, data) {
                !error ? resolve(data) : reject();
            });
        });
    }
};