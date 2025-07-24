import Chalk from "chalk";
import DotEnv from "dotenv";

DotEnv.config();

import { LogColor, LogColorBright, LogEventType, LogEventSeverity } from "./utils/Logging";
import { connect_db } from "./database/provider";

import HTTPServer from "./server";
import Settings from "./settings";

function clog(msg: string, color: LogColor | LogColorBright = "white", type: LogEventType = "system") {
    // Severity will definitely be assigned to
    let severity!: LogEventSeverity;

    try {
        switch (color) {
            case "red":
            case "redBright":
                msg = `[ERROR] ${msg}`;
                severity = "error";
                break;
            case "yellow":
            case "yellowBright":
                msg = `[WARN] ${msg}`;
                severity = "warning";
                break;
            default:
                msg = `[INFO] ${msg}`;
                severity = "debug";
        }

        console.log(Chalk[color](msg));
    }
    catch {
        console.log(msg);
    }
};

function errlog(error: Error) {
    clog(error.message + error.stack, "red");
}

process.on("uncaughtException", errlog);
process.on("unhandledRejection", errlog);

console.log("Connecting to database...");

(function init() {
    connect_db().then(async () => {
        console.log("Database successfully connected!");
        clog("Starting server...", "blue");
        new HTTPServer(clog);
    }).catch(() => {
        console.log("Failed to connect to database!");
        setTimeout(init, 2e4);
    });
})();