import Chalk from "chalk";

import HTTPServer from "./server";

function clog(msg, func = "white") {
    try {
        console.log(Chalk[func](msg));
    }
    catch {
        console.log(msg);
    }
};

process.on("uncaughtException", function (error) {
    clog(error, "red");
});

process.on("unhandledRejection", function (error) {
    clog(error, "red");
});

new HTTPServer(clog);