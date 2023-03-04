const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = [
	{
		entry: {
			"api-server": { import: "./src/api/server.ts", dependOn: "lib/express"},
			"lib/express": "express",
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
			client: { import: "./src/auth-client/client.tsx", dependOn: "mantine" },
			mantine: "@mantine/core",
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
		},
		output: {
			filename: "js/[name].js",
			path: path.resolve(__dirname, "dist", "auth-client"),
		},
		plugins: [new HTMLWebpackPlugin({ title: "Auth Client", template: "src/index.html" })],
		target: "web",
	},
];
