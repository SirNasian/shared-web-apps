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

export class ShoppingLists extends Model<InferAttributes<ShoppingLists>, InferCreationAttributes<ShoppingLists>> {
	declare id: string;
	declare name: string;
	declare owner: string;
	declare public: boolean;
}
ShoppingLists.init(
	{
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		owner: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		public: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
	},
	{
		tableName: "shoppinglist_lists",
		sequelize,
	}
);

export class ShoppingListItems extends Model<
	InferAttributes<ShoppingListItems>,
	InferCreationAttributes<ShoppingListItems>
> {
	declare id: string;
	declare list_id: string;
	declare name: string;
	declare quantity: number;
	declare checked: boolean;
}
ShoppingListItems.init(
	{
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		list_id: {
			type: DataTypes.STRING,
			references: {
				model: ShoppingLists,
				key: "id",
			},
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		quantity: {
			type: DataTypes.NUMBER,
			allowNull: false,
		},
		checked: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
	},
	{
		tableName: "shoppinglist_items",
		sequelize,
	}
);

export class ShoppingListEditors extends Model<
	InferAttributes<ShoppingListEditors>,
	InferCreationAttributes<ShoppingListEditors>
> {
	declare user_id: string;
	declare list_id: string;
}
ShoppingListEditors.init(
	{
		user_id: {
			type: DataTypes.STRING,
			references: {
				model: Users,
				key: "id",
			},
			allowNull: false,
		},
		list_id: {
			type: DataTypes.STRING,
			references: {
				model: ShoppingLists,
				key: "id",
			},
			allowNull: false,
		},
	},
	{
		tableName: "shoppinglist_editors",
		sequelize,
	}
);

sequelize.sync();
