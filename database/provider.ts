import { DataTypes, Sequelize } from "sequelize";

import { BypassTokenModel, SessionModel, SettingModel, UserModel } from "./models";
import { UserRole } from "../system/_types";

import Settings from "../settings";

const sequelize = new Sequelize({
    storage: "dev.db",
    dialect: "sqlite",
});

UserModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        validate: {
            len: [3, 16],
            isAlphanumeric: true,
        },
        allowNull: false,
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    roles: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false,
    },
    knownLocations: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false,
    },
    whitelistedLocations: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false,
    },
    disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    lastLogin: {
        type: DataTypes.DATE,
    },
    msaEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    msaSecret: {
        type: DataTypes.STRING,
    },
}, { sequelize, tableName: "users" });

SessionModel.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    secret: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    issue: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    pendingMsa: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    claimedMsaToken: {
        type: DataTypes.STRING,
    },
    remoteAddress: {
        type: DataTypes.STRING,
    },
}, { sequelize, tableName: "sessions" });

BypassTokenModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    secret: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, { sequelize, tableName: "bypass_tokens" });

SettingModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    value: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, { sequelize, tableName: "settings" });

UserModel.hasMany(SessionModel, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "sessions",
});

SessionModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user",
});

BypassTokenModel.belongsTo(UserModel, {
    foreignKey: "userId",
});

export async function connect_db() {
    await sequelize.authenticate();

    await sequelize.query("PRAGMA foreign_keys = false;");
    await sequelize.sync({ alter: true });
    await sequelize.query("PRAGMA foreign_keys = true;");

    await Settings.initialize();

    // Changing the ID or NAME of accounts will invalidate the preset password
    await UserModel.findOrCreate({
        where: { name: "admin" },
        defaults: {
            id: 1,
            name: "admin",
            // Password is 'admin'
            passwordHash: "0a37b33d81e4e7f80ea89dd32e8ee12a939c154e6767cd035c467f8de1eadedc",
            roles: [UserRole.Administrator],
            knownLocations: [],
            whitelistedLocations: [],
            disabled: false,
            msaEnabled: false,
        },
    });
}