import "dotenv/config";

import { isTruthy } from "../common/functions";

interface Config {
	[key: string]: string | number | boolean | undefined;
	DATABASE_LOG?: string;
	DATABASE_URI: string;
	PORT: number;
	SECRET: string;
	SERVE_SHOPPING_LIST: boolean;
}

const config_default: Config = {
	DATABASE_LOG: undefined,
	DATABASE_URI: "",
	PORT: 3000,
	SECRET: "secret",
	SERVE_SHOPPING_LIST: true,
};

export const config: Config = {
	...config_default,
	...process.env,
	PORT: Number(process.env.PORT ?? config_default.PORT),
	SERVE_SHOPPING_LIST:
		process.env.SERVE_SHOPPING_LIST !== undefined
			? isTruthy(process.env.SERVE_SHOPPING_LIST)
			: config_default.SERVE_SHOPPING_LIST,
};

Object.keys(config).forEach(
	(key) =>
		!["DATABASE_LOG", "DATABASE_URI", "PORT", "SECRET", "SERVE_SHOPPING_LIST"].includes(key) && delete config[key]
);
export default config;
