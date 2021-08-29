import { UserLogin, UserRole } from "../types";

export default {
    Router: {
        EnableDefaultRedirect: true,
        DefaultRoute: "login",
        APIDirectory: "/api/",
    },
    Static: {
        EnableStaticFileServer: true,
        EnableRuntimeObfuscation: true,
        RequestDirectory: "/content/",
        PhysicalDirectory: "./wwwroot/",
    },
    Session: {
        CookieName: "__|SITE::SECURITY",
    },
    Security: {
        DefaultUsers: {
            "admin": {
                id: 1,
                password: "admin",
                perms: {
                    roles: [
                        UserRole.SUPER,
                    ],
                },
            },
        } as { [name: string]: UserLogin },
        AddSecurityHeaders: true,
    },
};