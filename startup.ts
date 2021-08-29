import HTTPServer from "./server";

process.on("uncaughtException", function (error) {
    console.log(error);
});

process.on("unhandledRejection", function (error) {
    console.log(error);
});

console.log("Server loaded!");
new HTTPServer();