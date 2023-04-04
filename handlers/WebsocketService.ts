import * as WS from "ws";

import { Session } from "../system/_classes";

import HTTPServer from "../server";

export default class WebsocketService {
    constructor(server: WS.Server, base: HTTPServer) {
        this.server = server;
        this.base = base;
    }

    server: WS.Server;
    base: HTTPServer;

    incomingMessage(data: string, session: Session) {
        
    }

    socketAttached(ws: WS.WebSocket, session: Session) {
        this.base._log(`WebSocket client attached from user: ${session.user?.id}`);
    }

    socketDetached(ws: WS.WebSocket) {

    }
};