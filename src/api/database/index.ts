import fs from "fs";
import mariadb from "mariadb";
import mysql from "mysql2";
import { Sequelize } from "sequelize";

import config from "../config";
import { DefineUser } from "./users";
import { DefineShoppingList } from "./shoppinglist_lists";
import { DefineShoppingListItem } from "./shoppinglist_items";
import { DefineShoppingListEditor } from "./shoppinglist_editors";
import { DefineShoppingListViewer } from "./shoppinglist_viewers";

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

export const sequelize = new Sequelize(config.DATABASE_URI, { dialect, dialectModule, logging });
sequelize.authenticate();

export const User = DefineUser(sequelize);
export const ShoppingList = DefineShoppingList(sequelize);
export const ShoppingListItems = DefineShoppingListItem(sequelize);
export const ShoppingListEditor = DefineShoppingListEditor(sequelize);
export const ShoppingListViewer = DefineShoppingListViewer(sequelize);

ShoppingList.hasMany(ShoppingListItems, { foreignKey: "list_id", onDelete: "cascade" });
ShoppingList.hasMany(ShoppingListEditor, { foreignKey: "list_id", onDelete: "cascade" });
ShoppingList.hasMany(ShoppingListViewer, { foreignKey: "list_id", onDelete: "cascade" });
User.hasMany(ShoppingListEditor, { foreignKey: "user_id", onDelete: "cascade" });
User.hasMany(ShoppingListViewer, { foreignKey: "user_id", onDelete: "cascade" });

sequelize.sync();

export { UserAttributes } from "./users";
export { ShoppingListAttributes } from "./shoppinglist_lists";
export { ShoppingListItemAttributes } from "./shoppinglist_items";
export { ShoppingListEditorAttributes } from "./shoppinglist_editors";
export { ShoppingListViewerAttributes } from "./shoppinglist_viewers";
