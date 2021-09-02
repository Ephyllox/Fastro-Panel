import { QueryOptions } from "./input/InputOptions";

export type InterfaceRouteData = {
    path: string;

    method: string;

    requiresLogin?: boolean;

    query?: QueryOptions[];

    body?: boolean;
};