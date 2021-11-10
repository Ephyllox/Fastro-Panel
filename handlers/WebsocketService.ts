import * as WS from "ws";

import { Session } from "../system/_classes";

export default class WebsocketService {
    constructor(server: WS.Server) {
        this.server = server;
    }

    server: WS.Server;

    incomingMessage(data: string, session: Session) {
        
    }

    socketAttached(ws, session: Session) {
        console.log(`WS client attached by user: ${session.user.id}`);
    }

    socketDetached(ws) {

    }
};