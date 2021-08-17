export default {
    "/login": {
        Page: "login",
        RedirectIfAuthorized: "panel",
    },
    "/panel": {
        Page: "panel",
        RequiresLogin: true,
    },
    "/updates": {
        Page: "updates",
        RequiresLogin: true,
    },
};