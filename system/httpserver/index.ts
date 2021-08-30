import { Route } from "../classes";

//API Imports
import { LoginAPI, LogoutAPI } from "./routes/api/Auth";
import UserAPI from "./routes/api/User";
//View Imports
import LoginDir from "./routes/dir/Login";
import { PanelHomeDir, PanelUpdatesDir } from "./routes/dir/Panel";

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