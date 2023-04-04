import { IRequestResult } from "../../../../_interfaces";

import RequestContext from "../../RequestContext";

export class StatusResult implements IRequestResult {
    constructor(status: number, content: string = "") {
        this.status = status;
        this.content = content;
    }

    status: number;

    content: string;

    async execute(context: RequestContext): Promise<string> {
        context.status(this.status);
        return this.content;
    }
};