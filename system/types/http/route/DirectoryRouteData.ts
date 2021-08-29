export type DirectoryRouteData = {
    path: string;

    directory: string;

    requiresLogin?: boolean;

    redirectIfAuthorized?: string;
};