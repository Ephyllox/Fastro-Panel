const query = new URLSearchParams(window.location.search);

const config = {
    api_base: "/api",
};

class Router {
    constructor(name, default_method = "GET") {
        this.name = `${config.api_base}/${name}/`;
        this.default_method = default_method;
    }

    name;

    default_method;

    route(route, alias, default_method = this.default_method) {
        if (this[alias] !== undefined) {
            console.error(`ERROR :: Router - invalid route name '${alias}'`);
            return this;
        }

        this[alias] = async (method = default_method, data) => {
            return await this.#handle(route, method, data);
        };

        return this;
    }

    async #handle(path, method, data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.name + path,
                type: method,
                data: data && (method === "GET" ? data : JSON.stringify(data)),
                success: function (res) {
                    resolve(res);
                },
                error: function (xhr) {
                    if (xhr.status === 401 && xhr.responseText.match(/session expired/i)) {
                        if (typeof Swal !== "undefined") return sessionAlert();
                    }

                    reject(xhr);
                },
            });
        });
    }
}

const auth = new Router("auth", "POST")
    .route("validate-login", "validateLogin")
    .route("validate-login/msa", "validateMsa")
    .route("msa/setup", "setupMsa")
    .route("msa/remove", "removeMsa")
    .route("change-password", "changePassword")
    .route("logout", "logout");

const user = new Router("users")
    .route("list", "list")
    .route("create", "create")
    .route("update", "update")
    .route("identity", "identity");

const session = new Router("sessions")
    .route("list", "list")
    .route("revoke", "revoke");

const system = new Router("system")
    .route("svc-host/info", "svcHostInfo")
    .route("settings/get", "getSettings")
    .route("settings/set", "updateSettings")

window.resource = {
    login: "/login",
    verification: "/login/verification",
    home: "/panel",
    api: { auth, user, session, system },
};