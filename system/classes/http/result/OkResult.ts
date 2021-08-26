import { IRequestResult } from "../../../interfaces";

import RequestContext from "../RequestContext";

export default class OkResult implements IRequestResult {
    constructor(content = "") {
        this.content = content;
    }

    content: string;

    async execute(context: RequestContext): Promise<string> {
        return this.content;
    }
};