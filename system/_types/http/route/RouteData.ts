import { UserRole } from "../../auth/UserData";
import { QueryOptions } from "./input/InputOptions";

export type RouteData = {
    path: string;

    requiresLogin?: boolean;

    requiredRoles?: UserRole[];

    blocked?: boolean;

    query?: QueryOptions[];

    body?: boolean;
};