import { Route } from "../../_classes";

import FileUtils from "../../../utils/FileToolbox";
import LogDelegate from "../../../utils/Logging";
import Conf from "../../../utils/Configuration";

export const Routes: Route[] = [];

export async function loadRoutes(log: LogDelegate): Promise<void> {
    // The activator is required to instantiate route classes
    function activator<T extends Route>(type: { new(): T }): T {
        return new type();
    }

    await FileUtils.requireDirectory(Conf.Server.RouteDirectory).then(function (files) {
        files.forEach(module => {
            // Instantiate all routes and store them in memory
            Object.values(module).forEach(route => {
                try {
                    const activated = activator(route as never);
                    activated instanceof Route && Routes.push(activated);
                    log(`Loaded route: [${activated.path}], class: [${activated.constructor.name}]`, "gray");
                }
                catch {
                    // The module did not contain a class/constructor
                    return;
                }
            });
        });
    });
}