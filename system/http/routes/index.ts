import { Route } from "../../_classes";

// API Imports
import * as AuthAPI from "./api/Auth";
import * as UserAPI from "./api/User";
// View Imports
import * as AuthDIR from "./dir/Auth";
import * as PanelDIR from "./dir/Panel";

export const Routes: Route[] = [
    // APIs
    new AuthAPI.Login(),
    new AuthAPI.Logout(),
    new AuthAPI.Register(),
    new UserAPI.UserInfo(),
    // Views
    new AuthDIR.Login(),
    new AuthDIR.Register(),
    new PanelDIR.PanelHome(),
    new PanelDIR.PanelUpdates(),
];