import { DirectoryRoute } from "../../../classes";

export type PageRouteData = {
    directory: string;

    requiresLogin?: boolean;

    redirectIfAuthorized?: string;
};