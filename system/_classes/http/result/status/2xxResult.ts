import { StatusResult } from "./StatusResult";

export class OkResult extends StatusResult {
    constructor(content?: string) {
        super(200, content);
    }
};

export class NoContentResult extends StatusResult {
    constructor() {
        super(204);
    }
}