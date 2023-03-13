import config from "./config";

interface TokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

let _access_token: string;
let _refresh_token: string;

export const authorize = async (): Promise<void> => {
	const current_url = new URL(window.location.href);
	if (current_url.searchParams.has("code"))
		({ access_token: _access_token, refresh_token: _refresh_token } = await obtainTokens({
			authorization_code: current_url.searchParams.get("code"),
		}));
	else {
		const redirect_url = new URL("/authorize", config.API_URL);
		redirect_url.searchParams.append("response_type", "code");
		redirect_url.searchParams.append("redirect_uri", window.location.href);
		window.location.href = redirect_url.toString();
	}
};

export const obtainTokens = async ({
	authorization_code,
	refresh_token,
}: {
	authorization_code?: string;
	refresh_token?: string;
}): Promise<TokenResponse> => {
	const url = new URL("/authorize/token", config.API_URL);
	const body: string[] = [];
	authorization_code && body.push(`code=${encodeURIComponent(authorization_code)}`);
	refresh_token && body.push(`refresh_token=${encodeURIComponent(refresh_token)}`);
	body.push(`grant_type=${encodeURIComponent(authorization_code ? "authorization_code" : "refresh_token")}`);
	body.push(`scope=${encodeURIComponent(JSON.stringify([]))}`);
	const response = await window.fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.join("&"),
	});
	if (response.status !== 200) throw new Error(await response.text());
	return response.json();
};

export const request = async <T extends object>(
	path: string,
	{
		body,
		headers = {},
		method = "GET",
		query,
	}: {
		body?: string;
		headers?: { [key: string]: string };
		method?: "GET" | "POST" | "PUT" | "DELETE";
		query?: { [key: string]: string };
	} = {}
): Promise<T> => {
	const url = new URL(path, config.API_URL);
	query && Object.keys(query).forEach((param) => url.searchParams.append(param, query[param]));

	// Attempt Request
	let request = await window.fetch(url, {
		headers: { Authorization: `Bearer ${_access_token}`, ...headers },
		method,
		body,
	});
	if (request.status === 200) return request.json();
	if (request.status !== 401) throw new Error(await request.text());

	// Reattempt Request (Refresh)
	({ access_token: _access_token, refresh_token: _refresh_token } = await obtainTokens({
		refresh_token: _refresh_token,
	}));
	request = await window.fetch(url, {
		headers: { Authorization: `Bearer ${_access_token}`, ...headers },
		method,
		body,
	});
	if (request.status !== 200) throw new Error(await request.text());
	return request.json();
};
