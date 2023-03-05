const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = [
	{
		entry: {
			"api-server": { import: "./src/api/server.ts", dependOn: "lib/vendor" },
			"lib/vendor": ["dotenv", "express", "jsonwebtoken", "mariadb", "mysql2", "pg-hstore", "sequelize"],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: "ts-loader",
					exclude: /node_modules/,
				},
			],
		},
		resolve: {
			extensions: [".ts", ".js"],
		},
		output: {
			filename: "[name].js",
			path: path.resolve(__dirname, "dist"),
		},
		target: "node",
	},
	{
		entry: {
			client: { import: "./src/auth-client/client.tsx", dependOn: "vendor" },
			vendor: [
				"@emotion/react",
				"@mantine/core",
				"@mantine/form",
				"@mantine/hooks",
				"@mantine/notifications",
				"buffer",
				"react",
				"react-dom",
			],
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/,
				},
			],
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
			fallback: {
				buffer: require.resolve("buffer"),
			},
		},
		output: {
			filename: "js/[name].js",
			path: path.resolve(__dirname, "dist", "auth-client"),
		},
		plugins: [new HTMLWebpackPlugin({ title: "Auth Client", template: "src/index.html" })],
		target: "web",
	},
];
