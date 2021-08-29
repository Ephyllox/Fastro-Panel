import { StatusResult } from "./StatusResult";

export class OkResult extends StatusResult {
    constructor(content?: string) {
        super(200, content);
    }
};