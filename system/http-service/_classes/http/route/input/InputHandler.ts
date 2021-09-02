import * as URL from "url";
import * as BodyReader from "body-reader";

import RequestContext from "../../RequestContext";
import Route from "../Route";

export default abstract class InputHandler {
    static async handle(context: RequestContext, route: Route): Promise<boolean> {
        try {
            context.input = {
                body: null,
                query: {},
            };

            if (route.query) {
                for (const item of route.query) {
                    const query = URL.parse(context.req.url, true).query;
                    if (item.required && (!query || !query[item.name])) return false;
                    context.input.query[item.name] = query[item.name];
                }
            }

            if (route.body) {
                const body: object = await new Promise((resolve, reject) => {
                    BodyReader.Json.read(context.req, function (result) {
                        result.match({
                            Ok(body) {
                                resolve(body);
                            },
                            Err() {
                                reject();
                            },
                        });
                    });
                });

                if (!Object.keys(body).length) return false;
                context.input.body = body; //eslint-disable-line
            }

            return true;
        }
        catch {
            return false;
        }
    }
};