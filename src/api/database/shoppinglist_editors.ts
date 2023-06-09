import { DataTypes, InferAttributes, Model, Sequelize } from "sequelize";

export interface ShoppingListEditorAttributes extends Model<InferAttributes<ShoppingListEditorAttributes>> {
	user_id: string;
	list_id: string;
}

export const DefineShoppingListEditor = (sequelize: Sequelize) =>
	sequelize.define<ShoppingListEditorAttributes>("shoppinglist_editors", {
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		list_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
