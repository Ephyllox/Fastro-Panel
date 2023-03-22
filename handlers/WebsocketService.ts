import * as WS from "ws";

import { Session } from "../system/_classes";

export default class WebsocketService {
    constructor(server: WS.Server) {
        this.server = server;
    }

    server: WS.Server;

    incomingMessage(data: string, session: Session) {
        
    }

    socketAttached(ws: WS.WebSocket, session: Session) {
        console.log(`WebSocket client attached from user: ${session.user.id}`);
    }

    socketDetached(ws: WS.WebSocket) {

    }
};