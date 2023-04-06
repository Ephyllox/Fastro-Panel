import { InterfaceRoute, JsonResult, RequestContext } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";

export class UserInfo extends InterfaceRoute {
    constructor() {
        super({
            path: "user/identity",
            method: "POST",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new JsonResult(context.session.parse());
    }
};