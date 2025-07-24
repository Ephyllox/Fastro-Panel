import { UserRole } from "../../auth/UserData";
import { QueryOptions } from "./input/InputOptions";

export type RouteData = {
    path: string;

    requiresLogin?: boolean;

    requiredRoles?: UserRole[];

    accessibleDuringMsa?: boolean;

    blocked?: boolean;

    query?: QueryOptions[];

    body?: boolean;
};