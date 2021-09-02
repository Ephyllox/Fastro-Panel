import { UserLogin, UserRole } from "../http-service/_types";

export default abstract class Configuration {
    static Router = {
        EnableDefaultRedirect: true,
        DefaultRoute: "login",
        APIDirectory: "/api/",
    }

    static Static = {
        EnableStaticFileServer: true,
        EnableRuntimeObfuscation: false,
        EnableClientCaching: true,
        RequestDirectory: "/content/",
        PhysicalDirectory: "./wwwroot/",
        Integrated: {
            FileDirectory: "http-service/data/",
            ErrorFiles: {
                NotFound: "pages/errors/not-found.html",
                SvrError: "pages/errors/server-error.html",
            },
        },
    }

    static Websocket = {
        EnableWebsocket: true,
    }

    static Session = {
        CookieName: "__|SITE::SECURITY",
        CookieLength: 256,
        ValidityTime: 54e6,
        SpecialCharacters: false,
    }

    static Security = {
        DefaultUsers: {
            "admin": {
                id: 1,
                password: "adminadmin",
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