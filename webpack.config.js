const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = [
	{
		entry: { "api-server": "./src/api/server.ts" },
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
		externals: [ "pg-hstore" ],
		output: {
			filename: "[name].js",
			path: path.resolve(__dirname, "dist"),
		},
		target: "node",
		optimization: {
			splitChunks: {
				chunks: "all",
				name: "vendor",
			},
		},
	},
	{
		entry: { client: "./src/auth-client/client.tsx" },
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
		plugins: [new HTMLWebpackPlugin({ title: "Auth Client", template: "src/common/index.html" })],
		target: "web",
		optimization: {
			splitChunks: {
				chunks: "all",
				name: "vendor",
			},
		},
	},
	{
		entry: { client: "./src/shopping-list/client.tsx" },
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
			path: path.resolve(__dirname, "dist", "shopping-list"),
		},
		plugins: [new HTMLWebpackPlugin({ title: "Shopping List", template: "src/common/index.html" })],
		target: "web",
		optimization: {
			splitChunks: {
				chunks: "all",
				name: "vendor",
			},
		},
	},
];
