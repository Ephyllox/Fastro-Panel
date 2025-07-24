import { UserRole } from "../../auth/UserData";
import { QueryOptions } from "./input/InputOptions";

export type DirectoryRouteData = {
    path: string;

    directory: string;

    requiresLogin?: boolean;

    requiredRoles?: UserRole[];

    accessibleDuringMsa?: boolean;

    blocked?: boolean;

    redirectIfAuthorized?: string;

    query?: QueryOptions[];

    body?: boolean;
};