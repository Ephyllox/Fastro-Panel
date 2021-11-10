import { InterfaceRoute, JsonResult, RequestContext } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";

export default class UserAPI extends InterfaceRoute {
    constructor() {
        super({
            path: "identity",
            method: "POST",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new JsonResult(context.session.parse());
    }
};