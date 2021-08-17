export default {
    random: function (len) {
        let result = "";
        const characters = "abcdefghijklmnopqrstuvwxyz", charactersLength = characters.length;

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
};