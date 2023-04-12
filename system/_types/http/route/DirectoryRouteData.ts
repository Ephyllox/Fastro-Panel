import { UserRole } from "../../auth/UserData";
import { QueryOptions } from "./input/InputOptions";

export type DirectoryRouteData = {
    path: string;

    directory: string;

    requiresLogin?: boolean;

    requiredRoles?: UserRole[];

    blocked?: boolean;

    redirectIfAuthorized?: string;

    query?: QueryOptions[];

    body?: boolean;
};