import { QueryOptions } from "./input/InputOptions";

export type RouteData = {
    path: string;

    requiresLogin?: boolean;

    blocked?: boolean;

    query?: QueryOptions[];

    body?: boolean;
};