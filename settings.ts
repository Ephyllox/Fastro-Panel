import { SettingModel } from "./database/models";

export type SettingValue = string | number | boolean | string[];

const defaults: Record<string, SettingValue> = {
    auth_msa_cookie_length: 256,
    auth_msa_bypass_duration: 1209600000,
    auth_session_cookie_length: 512,
    auth_session_ip_interlock: false,
};

class Settings {
    private config: Record<string, SettingModel> = {};

    public async initialize(): Promise<void> {
        for (const key in defaults) {
            await SettingModel.findOrCreate({
                where: { key: key },
                defaults: {
                    key: key,
                    value: defaults[key],
                },
            });
        }

        SettingModel.findAll({ order: [["id", "ASC"]] }).then((settings) => {
            settings.forEach((item) => {
                if (defaults[item.key] === undefined) return item.destroy(); // Remove any unrecognized settings
                this.config[item.key] = item;
            });
        });
    }

    public get<T extends SettingValue>(key: string): T {
        return this.config[key]?.value as T;
    }

    public async set(key: string, value: SettingValue): Promise<void> {
        // Update model value in memory and database
        this.config[key] = await this.config[key].update({ value: value });
    }

    public getDefaultValue(key: string): SettingValue {
        return defaults[key];
    }

    public getAllSettings(): Record<string, SettingValue> {
        const dict: Record<string, SettingValue> = {};
        Object.keys(this.config).map(key => dict[key] = this.config[key].value);
        return dict;
    }
}

const settings = new Settings();

export default settings;