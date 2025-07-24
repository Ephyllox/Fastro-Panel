import * as QRCode from "qrcode";
import * as Speakeasy from "speakeasy";

import { Op } from "sequelize";
import { randomUUID, pbkdf2Sync } from "crypto";

import { BypassTokenModel, SessionModel, UserModel } from "../../../database/models";

import { CookieFlags, CookieOptions, CookieSitePolicy, ValidationData, VerificationSetupData } from "../../_types";

import Conf from "../../../utils/Configuration";
import Utils from "../../../utils/Toolbox";
import Settings from "../../../settings";

export default class AuthManager {
    private static getCookieFlags(): CookieFlags[] {
        return [
            CookieFlags.HttpOnly,
            ...process.env.PRODUCTION ? [CookieFlags.Secure] : [],
        ];
    }

    static hashCredentials(passwd: string, salt: string): string {
        return pbkdf2Sync(passwd, salt, 10000, 32, "sha256").toString("hex");
    }

    static verifyCredentials(user: UserModel, passwd: string): boolean {
        return this.hashCredentials(passwd, user.name + user.id) === user.passwordHash;
    }

    static async verifyMsaCode(user: UserModel, code: string): Promise<boolean> {
        // Check if msaSecret is populated instead of msaEnabled
        // This is because msaEnabled will be false during setup
        if (!user.msaSecret) return true;
        // Prevent one-time codes from being reused
        // This is done as the session claims the code after successful verification
        if (await SessionModel.findOne({ where: { claimedMsaToken: code, userId: user.id } })) return false;

        return Speakeasy.totp.verify({
            secret: user.msaSecret!,
            encoding: "base32",
            token: code,
        });
    }

    static async setupMsa(user: UserModel): Promise<VerificationSetupData> {
        const secret = Speakeasy.generateSecret({
            name: `${Conf.Security.MSA.Issuer}: ${user.name}`,
            length: Conf.Security.MSA.KeyLength,
        });

        await user.update({ msaEnabled: false, msaSecret: secret.base32 });

        return {
            secret: secret.base32,
            qrcode: await QRCode.toDataURL(secret.otpauth_url!),
        };
    }

    static async disableMsa(user: UserModel): Promise<void> {
        await SessionModel.update({ pendingMsa: false }, { where: { userId: user.id } });
        await BypassTokenModel.destroy({ where: { userId: user.id } });
        await user.update({ msaEnabled: false, msaSecret: null });
    }

    static async createBypassToken(user: UserModel): Promise<CookieOptions> {
        const token = Utils.random(Settings.get<number>("auth_msa_cookie_length"), false);
        const expiry = new Date(+new Date() + Settings.get<number>("auth_msa_bypass_duration"));

        await BypassTokenModel.create({
            secret: Utils.sha256(token),
            expiry: expiry,
            userId: user.id,
        });

        return {
            name: Conf.Security.MSA.CookieName,
            value: token,
            path: Conf.Security.MSA.CookiePath,
            expires: expiry,
            samesite: CookieSitePolicy.Strict,
            flags: this.getCookieFlags(),
        };
    }

    static async checkBypassToken(user: UserModel, token: string): Promise<boolean> {
        const model = await BypassTokenModel.findOne({ where: { secret: Utils.sha256(token), userId: user.id } });
        return model?.isValid || false;
    }

    static async checkLogin(name: string, passwd: string, bypassToken?: string, ip?: string): Promise<ValidationData> {
        const target = await UserModel.findOne({ where: { name: name } });

        if (target !== null && this.verifyCredentials(target, passwd)) {
            if (target.disabled) return { success: false, blocked: true };

            if (target.whitelistedLocations.length && !target.whitelistedLocations.includes(ip!)) {
                return { success: false, restricted: true };
            }

            const token = Utils.random(Settings.get<number>("auth_session_cookie_length"), Conf.Session.SpecialCharacters);
            const requireMsa = target.msaEnabled && (!bypassToken || !await this.checkBypassToken(target, bypassToken));
            const date = new Date();

            // If the login requires additional steps, the session expiry is shortened
            await SessionModel.create({
                id: randomUUID(),
                secret: Utils.sha256(token),
                issue: date,
                expiry: new Date(+date + (requireMsa ? Conf.Session.MSAValidityTime : Conf.Session.ValidityTime)),
                remoteAddress: ip,
                pendingMsa: requireMsa,
                userId: target.id,
            });

            const locations = [...target.knownLocations];
            // Don't append locations to the 'initial' user
            if (target.id !== 1 && !locations.includes(ip!)) locations.push(ip!);

            await target.update({ lastLogin: date, knownLocations: locations });

            // The cookie has a separate validity time to compensate for session expiry changes
            return {
                success: true,
                msa: requireMsa,
                cookie: {
                    name: Conf.Session.CookieName,
                    value: token,
                    path: "/",
                    expires: new Date(+date + Conf.Session.CookieValidityTime),
                    samesite: CookieSitePolicy.Strict,
                    flags: this.getCookieFlags(),
                },
            };
        }
        else {
            return { success: false };
        }
    }

    static async getSessionByToken(token: string, ip?: string): Promise<SessionModel | undefined> {
        try {
            return await SessionModel.findOne({
                where: {
                    secret: Utils.sha256(token),
                    ...Settings.get<boolean>("auth_session_ip_interlock") ? { remoteAddress: ip } : {},
                },
                include: [{ model: UserModel, as: "user" }],
            }) ?? undefined;
        }
        catch {
            return;
        }
    }

    static async getUserSessions(user_id: number): Promise<SessionModel[]> {
        return (await this.getAllSessions()).filter(session => session.userId === user_id);
    }

    static async getAllSessions(): Promise<SessionModel[]> {
        // Return valid sessions only
        return await SessionModel.findAll({
            order: [["createdAt", "ASC"]],
            where: { expiry: { [Op.gt]: new Date() } },
            include: [{ model: UserModel, as: "user" }],
        });
    }

    static async getSessionById(session_id: string): Promise<SessionModel | undefined> {
        return (await this.getAllSessions()).find(session => session.id === session_id);
    }

    static async removeUserSessions(user_id: number): Promise<void> {
        const sessions = await this.getUserSessions(user_id);
        for (const session of sessions) await session.destroy();
    }

    static async removeExpiredItems(): Promise<void> {
        // Unsure if this is appropriate usage
        const clause = { expiry: { [Op.lte]: new Date() } };

        await SessionModel.destroy({ where: clause });
        await BypassTokenModel.destroy({ where: clause });
    }
};