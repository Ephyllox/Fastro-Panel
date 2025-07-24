import OS from "os";
import Axios from "axios";

import assert from "assert";

import { InterfaceRoute, JsonResult, NoContentResult, RequestContext } from "../../../_classes";
import { IRequestResult } from "../../../_interfaces";
import { UserRole } from "../../../_types";

import Settings, { SettingValue } from "../../../../settings";

export class ServiceHostInfo extends InterfaceRoute {
    constructor() {
        super({
            path: "system/svc-host/info",
            methods: ["GET"],
            requiresLogin: true,
        });
    }

    private ipCache?: string;

    private ipNextUpdate: number = Date.now();

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const date = Date.now();

        if (date >= this.ipNextUpdate) {
            try {
                const ip = await Axios.get("https://api.ipify.org/");
                this.ipNextUpdate = date + 3e4;
                this.ipCache = ip.data;
            }
            catch (error) {
                const e = error as Error;
                context._log(`Failed to retrieve host IP address -> ${e?.stack + e?.message}`, "redBright", "system");
                this.ipCache = undefined;
            }
        }

        return new JsonResult({
            host_name: OS.hostname(),
            host_date: new Date(date).toString(),
            public_ip: this.ipCache,
            os_uptime: OS.uptime(),
            os_info: `${OS.type()} ${OS.release()}`,
        });
    }
};

export class GetSettings extends InterfaceRoute {
    constructor() {
        super({
            path: "system/settings/get",
            methods: ["GET"],
            requiresLogin: true,
            requiredRoles: [UserRole["Settings Manager"]],
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const settings_dict = Settings.getAllSettings();
        const mapped_settings: object[] = [];

        Object.entries(settings_dict).forEach(([key, value]) => mapped_settings.push({
            Key: key,
            Value: value,
            Type: !Array.isArray(value) ? typeof value : "array",
            DefaultValue: Settings.getDefaultValue(key),
        }));

        return new JsonResult(mapped_settings);
    }
};

type SettingsUpdateDetails = {
    settings: { [key: string]: SettingValue };
};

export class UpdateSettings extends InterfaceRoute {
    constructor() {
        super({
            path: "system/settings/set",
            methods: ["PATCH"],
            body: true,
            requiresLogin: true,
            requiredRoles: [UserRole["Settings Manager"]],
            ratelimit: {
                maxRequests: 5,
                timeout: 5000,
                message: "Too many settings updates, try again later.",
            },
        });
    }

    async onRequest(context: RequestContext): Promise<IRequestResult> {
        const data = context.input.body as SettingsUpdateDetails;

        for (const key in data.settings) {
            const setting = Settings.get(key);
            const value = data.settings[key];

            assert(setting !== undefined && typeof setting === typeof value, `${key} is not a recognized setting.`);
            if (typeof value === "number") assert(Number.isSafeInteger(value), `${key} is an invalid integer.`);
            if (Array.isArray(value)) assert(value.every(item => typeof item === "string"), `${key} is an invalid array.`);

            await Settings.set(key, value);
        }

        const settingsLog = Object.entries(data.settings).map(([key, value]) => {
            return `${key}: ${value}`;
        }).join(", ");

        context._log(`${context.session!.user!.name} has updated the system settings: ${settingsLog}`, "white", "audit");
        return new NoContentResult();
    }
};