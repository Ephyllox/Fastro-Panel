import { IRequestResult } from "../../../interfaces";

import RequestContext from "../RequestContext";

import Utils from "../../../utils/Toolbox";

export default class ViewResult implements IRequestResult {
    constructor(path: string) {
        this.path = path;
    }

    path: string;

    async execute(context: RequestContext): Promise<string> {
        return await Utils.readFile(this.path);
    }
};