const path = require("path");

module.exports = [
	{
		entry: { "api-server": "./src/api/server.ts" },
		module: {
			rules: [
				{
					test: /\.ts?$/,
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
];
