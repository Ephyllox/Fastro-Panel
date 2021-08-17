import * as FS from "fs";

export default {
    random: function (len) {
        let result = "";
        const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%()_+-/~\\", charactersLength = characters.length;

        for (let i = 0; i < len; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    },
    getCookies: function (request) {
        const cookies = {};
        if (!request.headers.cookie) return cookies;

        request.headers.cookie.split(";").forEach(function (cookie) {
            const parts = cookie.match(/(.*?)=(.*)$/);
            cookies[parts[1].trim()] = (parts[2] || "").trim();
        });

        return cookies;
    },
    readFile: function (path) {
        return new Promise<string>((resolve, reject) => {
            FS.readFile(path, "utf8", function (error, data) {
                !error ? resolve(data.toString()) : reject();
            });
        });
    },
};