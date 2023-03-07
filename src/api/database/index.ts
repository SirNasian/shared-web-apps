import fs from "fs";
import mariadb from "mariadb";
import mysql from "mysql2";
import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

import config from "../config";

const dialect = String(config.DATABASE_URI).split(":")[0];
const logging = (sql: string) =>
	config.DATABASE_LOG && fs.appendFileSync(config.DATABASE_LOG, `[${new Date().toLocaleString()}] ${sql}\n`);

let dialectModule;
switch (dialect) {
	case "mysql":
		dialectModule = mysql;
		break;
	case "mariadb":
		dialectModule = mariadb;
		break;
	default:
		throw new Error(`Unsupported dialect "${dialect}"`);
}

const sequelize = new Sequelize(config.DATABASE_URI, { dialect, dialectModule, logging });
sequelize.authenticate();

export class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>> {
	declare id: string;
	declare displayname: string;
	declare username: string;
	declare password: string;
}
Users.init(
	{
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		displayname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: "users",
		sequelize,
	}
);

sequelize.sync();
