import { DataTypes, InferAttributes, Model, Sequelize } from "sequelize";

export interface UserAttributes extends Model<InferAttributes<UserAttributes>> {
	id: string;
	displayname: string;
	username: string;
	password: string;
}

export const DefineUser = (sequelize: Sequelize) =>
	sequelize.define<UserAttributes>("users", {
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
	});
