import { InterfaceRoute, DirectoryRoute } from "../classes";

//API Imports
import { LoginAPI, LogoutAPI } from "./routes/api/Auth";
import UserAPI from "./routes/api/User";
//View Imports
import LoginDir from "./routes/dir/Login";
import PanelHomeDir from "./routes/dir/PanelHome";
import PanelUpdatesDir from "./routes/dir/PanelUpdates";

export const Routes: (InterfaceRoute | DirectoryRoute)[] = [
    //APIs
    new LoginAPI(),
    new LogoutAPI(),
    new UserAPI(),
    //Views
    new LoginDir(),
    new PanelHomeDir(),
    new PanelUpdatesDir(),
];