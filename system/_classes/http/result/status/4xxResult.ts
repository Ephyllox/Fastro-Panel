import { StatusResult } from "./StatusResult";

export class BadRequestResult extends StatusResult {
    constructor(content?: string) {
        super(400, content);
    }
};

export class UnauthorizedResult extends StatusResult {
    constructor(content?: string) {
        super(401, content);
    }
};

export class MethodNotAllowedResult extends StatusResult {
    constructor(content?: string) {
        super(405, content);
    }
}