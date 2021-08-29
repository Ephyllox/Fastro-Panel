import * as Obfuscator from "javascript-obfuscator";
import * as Terser from "terser";

import { RequestContext } from "../system/classes";
import { ContentType } from "../system/types";

import HTTPServer from "../server";
import Conf from "../system/utils/Configuration";
import Utils from "../system/utils/Toolbox";

export default class StaticResourceHandler {
    constructor(base: HTTPServer) {
        this.base = base;
    }

    private base: HTTPServer;

    async process(context: RequestContext, url: string) {
        const path = Conf.Static.PhysicalDirectory + url.replace(Conf.Static.RequestDirectory, "");
        let contentType: ContentType;

        Object.keys(ContentType).forEach(item => {
            if (path.endsWith(`.${item.toLowerCase()}`)) {
                contentType = ContentType[item];
            }
        });

        try {
            let data = await Utils.readFile(path);

            if (Conf.Static.EnableRuntimeObfuscation && contentType === ContentType.JS && !global[path]) {
                data = Obfuscator.obfuscate(data, Obfuscator.getOptionsByPreset("default")).getObfuscatedCode();
                global[path] = (await Terser.minify(data)).code; //eslint-disable-line
            }

            context.header("Cache-Control", "private, max-age=86400;");
            context.contentType(contentType);
            context.end(global[path] ?? data);
        }
        catch {
            console.log(`Static resource exception from: ${context.requestId}.`);
            this.base.renderActionFailure(context, Conf.Static.Integrated.ErrorFiles.SvrError);
        }
    }
};