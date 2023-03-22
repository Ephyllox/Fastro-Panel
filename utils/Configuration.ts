import { UserLogin, UserRole } from "../system/_types";

export default abstract class Configuration {
    static Router = {
        EnableDefaultRedirect: true,
        DefaultRoute: "login",
        APIDirectory: "/api/",
    }

    static Static = {
        EnableStaticFileServer: true,
        EnableClientCaching: true,
        VirtualDirectory: "/content/",
        PhysicalDirectory: "/wwwroot/",
        Integrated: {
            FileDirectory: "http/",
            ErrorFiles: {
                NotFound: "pages/errors/not-found.html",
                SvrError: "pages/errors/server-error.html",
            },
        },
    }

    static Websocket = {
        EnableWebsocket: false,
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
                passwd: "adminadmin",
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