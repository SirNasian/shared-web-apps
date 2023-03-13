interface Config {
	API_URL: string;
}

const config_default: Config = {
	API_URL: "http://localhost:3000/",
};

export const config = {
	...config_default,
	...((window as unknown as { env: Config }).env ?? {}),
};

export default config;
