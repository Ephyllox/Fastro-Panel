import HTTPServer from "./server";

process.on("uncaughtException", function (error) {
    console.log(`System error: ${error}.`);
});

console.log("Server loaded!");
new HTTPServer();