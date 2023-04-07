import { UserLogin, UserRole } from "../system/_types";

export default abstract class Configuration {
    static Server = {
        DefaultPort: 1337,
        RouteDirectory: "system/http/routes",
    }

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
                Unauthorized: "pages/errors/unauthorized.html",
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

    // Changing the ID or NAME of accounts will invalidate the preset password
    static Security = {
        DefaultUsers: {
            "admin": {
                id: 1,
                // Password is 'admin'
                passwd: "0a37b33d81e4e7f80ea89dd32e8ee12a939c154e6767cd035c467f8de1eadedc",
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