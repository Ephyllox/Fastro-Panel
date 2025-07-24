import { UUID } from "crypto";
import {
    Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute, Association,
    HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManySetAssociationsMixin, HasManyRemoveAssociationMixin
} from "sequelize";

import { UserRole } from "../system/_types";

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    declare id: CreationOptional<number>;

    declare name: string;
    declare passwordHash: string;
    declare roles: UserRole[];
    declare knownLocations: string[];
    declare whitelistedLocations: string[];
    declare disabled: boolean;
    declare lastLogin?: Date;

    declare msaEnabled: boolean;
    declare msaSecret?: string | null;

    declare sessions?: NonAttribute<SessionModel[]>;

    declare getSessions: HasManyGetAssociationsMixin<SessionModel>;
    declare addSessions: HasManyAddAssociationMixin<SessionModel, UUID>;
    declare setSessions: HasManySetAssociationsMixin<SessionModel, UUID>;
    declare removeSessions: HasManyRemoveAssociationMixin<SessionModel, UUID>;

    declare static associations: {
        sessions: Association<UserModel, SessionModel>;
    };

    hasRoles(roles: UserRole[]): NonAttribute<boolean> {
        if (this.roles.includes(UserRole.Administrator)) return true;
        return roles.every(role => this.roles.includes(role));
    }
}

export class SessionModel extends Model<InferAttributes<SessionModel>, InferCreationAttributes<SessionModel>> {
    declare id: CreationOptional<UUID>;

    declare secret: string;
    declare issue: Date;
    declare expiry: Date;
    declare pendingMsa: boolean;
    declare claimedMsaToken?: string;
    declare remoteAddress?: string;

    declare userId: ForeignKey<UserModel["id"]>;
    declare user?: NonAttribute<UserModel>;

    get isValid(): NonAttribute<boolean> {
        return this.expiry > new Date();
    }
}

export class BypassTokenModel extends Model<InferAttributes<BypassTokenModel>, InferCreationAttributes<BypassTokenModel>> {
    declare id: CreationOptional<number>;

    declare secret: string;
    declare expiry: Date;

    declare userId: ForeignKey<UserModel["id"]>;

    get isValid(): NonAttribute<boolean> {
        return this.expiry > new Date();
    }
}

export class SettingModel extends Model<InferAttributes<SettingModel>, InferCreationAttributes<SettingModel>> {
    declare id: CreationOptional<number>;

    declare key: string;
    declare value: string | number | boolean | string[];
}