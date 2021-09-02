import { QueryOptions } from "./input/InputOptions";

export type DirectoryRouteData = {
    path: string;

    directory: string;

    requiresLogin?: boolean;

    redirectIfAuthorized?: string;

    query?: QueryOptions[];

    body?: boolean;
};