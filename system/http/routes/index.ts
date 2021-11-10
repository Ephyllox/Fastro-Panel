import { Route } from "../../_classes";

//API Imports
import { LoginAPI, LogoutAPI } from "./api/Auth";
import UserAPI from "./api/User";
//View Imports
import LoginDir from "./dir/Login";
import { PanelHomeDir, PanelUpdatesDir } from "./dir/Panel";

export const Routes: Route[] = [
    //APIs
    new LoginAPI(),
    new LogoutAPI(),
    new UserAPI(),
    //Views
    new LoginDir(),
    new PanelHomeDir(),
    new PanelUpdatesDir(),
];