export default abstract class Configuration {
    static Server = {
        DefaultPort: 1337,
        RouteDirectory: "system/http/routes",
    }

    static Router = {
        EnableDefaultRedirect: true,
        DefaultRoute: "/login",
        APIDirectory: "/api/",
    }

    static Static = {
        EnableStaticFileServer: true,
        EnableServerCaching: true,
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

    static Session = {
        CookieName: "__FASTRO_SESSION",
        CookieValidityTime: 604800000, // 1 week
        ValidityTime: 259200000, // 3 days
        MSAValidityTime: 300000, // 5 minutes
        SpecialCharacters: true,
    }

    static Security = {
        AddSecurityHeaders: true,
        MSA: {
            CookieName: "MSA::BYPASS",
            CookiePath: "/api/auth/validate-login",
            Issuer: "Fastro-Panel",
            KeyLength: 16,
        },
    }
};