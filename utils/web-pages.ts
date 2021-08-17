import { PageRoute } from "../types";

const PageRoutes: { [name: string]: PageRoute } = {
    "/login": {
        directory: "login.html",
        redirectIfAuthorized: "panel",
    },
    "/panel": {
        directory: "panel.html",
        requiresLogin: true,
    },
    "/updates": {
        directory: "updates.html",
        requiresLogin: true,
    },
    "404": {
        directory: "not-found.html",
        systemRouted: true,
    },
};

export default PageRoutes;