import { InterfaceRoute, OkResult, RequestContext } from "../../../classes";
import { IRequestResult } from "../../../interfaces";

export default class UserAPI extends InterfaceRoute {
    constructor() {
        super({
            path: "identity",
            method: "POST",
            requiresLogin: true,
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        return new OkResult(context.session.toJSON());
    }
};