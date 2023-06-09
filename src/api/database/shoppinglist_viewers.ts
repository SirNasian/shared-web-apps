import { DataTypes, InferAttributes, Model, Sequelize } from "sequelize";

export interface ShoppingListViewerAttributes extends Model<InferAttributes<ShoppingListViewerAttributes>> {
	user_id: string;
	list_id: string;
}

export const DefineShoppingListViewer = (sequelize: Sequelize) =>
	sequelize.define<ShoppingListViewerAttributes>("shoppinglist_viewers", {
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		list_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
