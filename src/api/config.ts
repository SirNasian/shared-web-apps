import "dotenv/config";

interface Config {
	[key: string]: string | number;
	DATABASE_LOG?: string;
	DATABASE_URI: string;
	PORT: number;
	SECRET: string;
}

const config_default: Config = {
	DATABASE_LOG: undefined,
	DATABASE_URI: "",
	PORT: 3000,
	SECRET: "secret",
};

export const config: Config = {
	...config_default,
	...process.env,
	PORT: Number(process.env.PORT ?? config_default.PORT),
};

Object.keys(config).forEach(
	(key) => !["DATABASE_LOG", "DATABASE_URI", "PORT", "SECRET"].includes(key) && delete config[key]
);
export default config;
