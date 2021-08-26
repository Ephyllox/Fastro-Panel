import { UserLogin, UserRole } from "../types";

export default {
    Router: {
        EnableDefaultRedirect: true,
        DefaultRoute: "login",
    },
    Static: {
        EnableStaticFileServer: true,
        EnableRuntimeObfuscation: true,
        RequestDirectory: "/content/",
        PhysicalDirectory: "./wwwroot/",
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