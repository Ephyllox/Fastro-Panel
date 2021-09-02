import { QueryOptions } from "./input/InputOptions";

export type RouteData = {
    path: string;

    requiresLogin?: boolean;

    query?: QueryOptions[];

    body?: boolean;
};