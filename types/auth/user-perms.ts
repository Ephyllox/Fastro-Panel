import { UserRole } from "../../enums";

export type UserPerms = {
    roles: UserRole[];

    disabled?: boolean;
};