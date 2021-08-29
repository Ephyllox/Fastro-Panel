export type PageRouteData = {
    path: string;

    directory: string;

    requiresLogin?: boolean;

    redirectIfAuthorized?: string;
};