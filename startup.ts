import HTTPServer from "./server";

process.on("uncaughtException", function (error) {
    console.log(error);
});

console.log("Server loaded!");
new HTTPServer();