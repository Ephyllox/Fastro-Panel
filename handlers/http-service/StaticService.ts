import * as Terser from "terser";

import { RequestContext } from "../../system/http-service/_classes";
import { IHttpServiceHandler } from "../../system/http-service/_interfaces";
import { ContentType } from "../../system/http-service/_types";

import HTTPServer from "../../server";
import Conf from "../../system/utils/Configuration";
import Utils from "../../system/utils/Toolbox";

export default class StaticService implements IHttpServiceHandler {
    constructor(base: HTTPServer) {
        this.base = base;
    }

    base: HTTPServer;

    async process(context: RequestContext, url: string) {
        const path = Conf.Static.PhysicalDirectory + url.replace(Conf.Static.RequestDirectory, "");
        let contentType: ContentType;

        Object.keys(ContentType).forEach(item => {
            if (path.endsWith(`.${item.toLowerCase()}`)) {
                contentType = ContentType[item];
            }
        });

        try {
            if (!global[path]) {
                const data = await Utils.readFile(path);

                if (contentType === ContentType.JS) {
                    global[path] = (await Terser.minify(data)).code; //eslint-disable-line
                }
                else {
                    global[path] = data; //eslint-disable-line
                }
            }

            if (Conf.Static.EnableClientCaching) context.header("Cache-Control", "private, max-age=86400;");

            context.contentType(contentType);

            context.end(global[path]);
        }
        catch {
            console.log(`Static resource exception from: ${context.requestId}.`);

            this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.SvrError);
        }
    }
};