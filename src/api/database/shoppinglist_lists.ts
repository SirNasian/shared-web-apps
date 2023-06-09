import { DataTypes, InferAttributes, Model, Sequelize } from "sequelize";

export interface ShoppingListAttributes extends Model<InferAttributes<ShoppingListAttributes>> {
	id: string;
	name: string;
	owner: string;
	public: boolean;
}

export const DefineShoppingList = (sequelize: Sequelize) =>
	sequelize.define<ShoppingListAttributes>("shoppinglist_lists", {
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
	});
