import { IRequestHandler, IRequestResult } from "../../../_interfaces";
import { QueryOptions, RouteData, UserRole } from "../../../_types";
import { NoContentResult } from "../result/status/2xxResult";

import RequestContext from "../RequestContext";

export default class Route implements RouteData, IRequestHandler {
    constructor(options: RouteData) {
        this.path = options.path;
        this.body = options.body;
        this.query = options.query;
        this.requiresLogin = options.requiresLogin;
        this.requiredRoles = options.requiredRoles;
        this.accessibleDuringMsa = options.accessibleDuringMsa;
        this.blocked = options.blocked;
    }

    path: string;

    requiresLogin?: boolean;

    requiredRoles?: UserRole[];

    accessibleDuringMsa?: boolean;

    blocked?: boolean;

    query?: QueryOptions[];

    body?: boolean;

    isUserAuthorized(context: RequestContext): boolean {
        // Check that the user has passed verification for the session
        if (context.session?.pendingMsa && !this.accessibleDuringMsa) return false;
        if (!this.requiredRoles || !context.session) return true;

        return this.requiredRoles.some(role => context.session!.user?.hasRoles([role]));
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new NoContentResult();
    }
};