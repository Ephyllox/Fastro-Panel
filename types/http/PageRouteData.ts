export type PageRoute = {
    directory: string;

    requiresLogin?: boolean;

    redirectIfAuthorized?: string;

    systemRouted?: boolean;
};