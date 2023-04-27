import { IRequestResult } from "../../../_interfaces";
import { ContentType } from "../../../_types";

import RequestContext from "../RequestContext";

export default class JsonResult implements IRequestResult {
    constructor(object: object | boolean) {
        this.object = JSON.stringify(object);
    }

    object: string;

    async execute(context: RequestContext): Promise<string> {
        context.contentType(ContentType.JSON);
        return this.object;
    }
};