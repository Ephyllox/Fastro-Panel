import HTTPServer from "../server";

export default class WebsocketService {
    constructor(base: HTTPServer) {
        this.base = base;
    }

    private base: HTTPServer;

    incomingMessage() {

    }

    socketAttached() {

    }

    socketDetached() {

    }
};