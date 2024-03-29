import assert from "assert";

import { AuthManager, BadRequestResult, InterfaceRoute, JsonResult, NoContentResult, RequestContext } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";
import { UserRole } from "../../../_types";

export class SessionList extends InterfaceRoute {
    constructor() {
        super({
            path: "sessions/list",
            methods: ["GET"],
            requiresLogin: true,
            requiredRoles: [UserRole.ADMIN],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const session_array = AuthManager.getAllSessions();
        const mapped_sessions: object[] = [];

        session_array.forEach(item => mapped_sessions.push({
            Username: item.user.name,
            UserId: item.user.id,
            SessionId: item.id,
            CreationDate: item.creation,
        }));

        return new JsonResult(mapped_sessions);
    }
};

type SessionRevocationDetails = {
    session_id: string,
};

export class RevokeSession extends InterfaceRoute {
    constructor() {
        super({
            path: "sessions/revoke",
            methods: ["POST"],
            body: true,
            requiresLogin: true,
            requiredRoles: [UserRole.ADMIN],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as SessionRevocationDetails;

        if (data.session_id) {
            const session = AuthManager.getSessionById(data.session_id);

            assert(session !== undefined, "The specified session is invalid.");
            // Deny if the target is the 'initial' user, but always allow action against the current user
            assert(session.user.id !== 1 || session.user.id === context.session!.user.id, "You cannot modify the initial user.");

            session.invalidate();

            return new NoContentResult();
        }

        return new BadRequestResult("You must provide a session identifier.");
    }
};