import fs from "fs";
import mariadb from "mariadb";
import mysql from "mysql2";
import { Sequelize, DataTypes } from "sequelize";

const dialect = String(process.env.DATABASE_URI ?? "").split(":")[0];
const logging = (sql: string) =>
	process.env.DATABASE_LOG && fs.appendFileSync(process.env.DATABASE_LOG, `[${new Date().toLocaleString()}] ${sql}\n`);

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

const sequelize = new Sequelize(process.env.DATABASE_URI, { dialect, dialectModule, logging });
sequelize.authenticate();

export const User = sequelize.define("user", {
	id: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});
User.sync();
