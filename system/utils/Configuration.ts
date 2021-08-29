import { UserLogin, UserRole } from "../types";

export default abstract class Configuration {
    static Router = {
        EnableDefaultRedirect: true,
        DefaultRoute: "login",
        APIDirectory: "/api/",
    }

    static Static = {
        EnableStaticFileServer: true,
        EnableRuntimeObfuscation: true,
        EnableClientCaching: true,
        RequestDirectory: "/content/",
        PhysicalDirectory: "./wwwroot/",
        Integrated: {
            ErrorFiles: {
                NotFound: "pages/errors/not-found.html",
                SvrError: "pages/errors/server-error.html",
            },
        },
    }

    static Session = {
        CookieName: "__|SITE::SECURITY",
        CookieLength: 256,
        ValidityTime: 54e6,
        SpecialCharacters: true,
    }

    static Security = {
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
    }
};