import { PageRoute } from "../../types";

const PageRoutes: { [name: string]: PageRoute } = {
    "/login": {
        directory: "./pages/login.html",
        redirectIfAuthorized: "panel",
    },
    "/panel": {
        directory: "./pages/panel.html",
        requiresLogin: true,
    },
    "/updates": {
        directory: "./pages/updates.html",
        requiresLogin: true,
    },
    "404": {
        directory: "./pages/not-found.html",
        systemRouted: true,
    },
};

export default PageRoutes;