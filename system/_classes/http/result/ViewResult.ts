import * as Mustache from "mustache";
import * as XSS from "xss";

import { IRequestResult } from "../../../_interfaces";

import RequestContext from "../RequestContext";
import Utils from "../../../../utils/Toolbox";

export default class ViewResult implements IRequestResult {
    constructor(path: string, template?: object) {
        this.path = path;
        this.template = template;
    }

    path: string;

    template?: object;

    async execute(context: RequestContext): Promise<string> {
        // Remove all comments and render the shared template
        const data = XSS.stripCommentTag(await Utils.readFile(this.path));

        // Merge default template data with custom template data from the route, then render it
        return Mustache.render(data, Object.assign(context.template, this.template));
    }
};