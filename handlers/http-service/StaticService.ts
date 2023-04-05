import * as Terser from "terser";

import { RequestContext } from "../../system/_classes";
import { IHttpServiceHandler } from "../../system/_interfaces";
import { ContentType } from "../../system/_types";

import HTTPServer from "../../server";
import Conf from "../../utils/Configuration";
import Utils from "../../utils/Toolbox";

export default class StaticService implements IHttpServiceHandler {
    constructor(base: HTTPServer) {
        this.base = base;
    }

    base: HTTPServer;

    cache: { [file: string]: string } = {};

    async process(context: RequestContext, url: string) {
        const path = Conf.Static.PhysicalDirectory + url.replace(Conf.Static.VirtualDirectory, "");
        let contentType!: ContentType;

        Object.keys(ContentType).forEach((item: keyof typeof ContentType) => {
            if (path.endsWith(`.${item.toLowerCase()}`)) {
                contentType = ContentType[item];
            }
        });

        try {
            if (!this.cache[path]) {
                const data = await Utils.readFile(path, ".");

                if (contentType === ContentType.JS) {
                    const minified = await Terser.minify(data);
                    this.cache[path] = minified.code ?? data;
                }
                else {
                    this.cache[path] = data;
                }
            }

            if (Conf.Static.EnableClientCaching) context.header("Cache-Control", "private, max-age=86400;");

            context.contentType(contentType);

            context.end(this.cache[path]);
        }
        catch {
            this.base._log(`Static resource exception from: ${context.requestId}.`, "yellow");

            this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.SvrError, 500);
        }
    }
};