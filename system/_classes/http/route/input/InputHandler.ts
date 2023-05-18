import * as URL from "url";

import RequestContext from "../../RequestContext";
import Route from "../Route";

export default abstract class InputHandler {
    static async handle(context: RequestContext, route: Route): Promise<boolean> {
        try {
            if (route.query) {
                for (const item of route.query) {
                    const query = URL.parse(context.req.url!, true).query;
                    if (item.required && !query[item.name]) return false; // Possibility of a null 'query'
                    context.input.query[item.name] = query[item.name];
                }
            }

            if (route.body) {
                const body: object = await new Promise((resolve, reject) => {
                    const rx = context.req, length = parseInt(rx.headers["content-length"] ?? "0");
                    const buf: Buffer[] = [];

                    if (length === 0) {
                        return resolve({});
                    }

                    rx.on("data", function (chunk) {
                        const bodyChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                        buf.push(bodyChunk);
                    });

                    rx.on("end", function () {
                        const concatenated = Buffer.concat(buf).toString("utf-8");

                        try {
                            resolve(JSON.parse(concatenated));
                        }
                        catch {
                            reject();
                        }
                    });

                    rx.on("error", function () {
                        rx.pause();
                        rx.unpipe();
                        reject();
                    });
                });

                if (!Object.keys(body).length) return false;
                context.input.body = body;
            }

            return true;
        }
        catch {
            return false;
        }
    }
};