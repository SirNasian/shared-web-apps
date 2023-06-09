import { DataTypes, InferAttributes, Model, Sequelize } from "sequelize";

export interface ShoppingListItemAttributes extends Model<InferAttributes<ShoppingListItemAttributes>> {
	id: string;
	list_id: string;
	name: string;
	quantity: number;
	checked: boolean;
}

export const DefineShoppingListItem = (sequelize: Sequelize) =>
	sequelize.define<ShoppingListItemAttributes>("shoppinglist_items", {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		list_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		checked: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
	});
