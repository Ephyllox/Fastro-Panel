import { QueryOptions } from "./input/InputOptions";

export type InterfaceRouteData = {
    path: string;

    method: string;

    requiresLogin?: boolean;

    blocked?: boolean;

    query?: QueryOptions[];

    body?: boolean;
};