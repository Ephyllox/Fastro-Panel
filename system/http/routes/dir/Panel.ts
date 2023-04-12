import { DirectoryRoute, RequestContext, ViewResult } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";
import { UserRole } from "../../../_types";

export class Home extends DirectoryRoute {
    constructor() {
        super({
            path: "/panel",
            directory: "pages/panel.html",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory);
    }
};

export class Updates extends DirectoryRoute {
    constructor() {
        super({
            path: "/updates",
            directory: "pages/updates.html",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory);
    }
};

export class Management extends DirectoryRoute {
    constructor() {
        super({
            path: "/management",
            directory: "pages/management.html",
            requiresLogin: true,
            requiredRoles: [UserRole.ADMIN],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new ViewResult(this.directory);
    }
};