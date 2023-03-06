import { JwtPayload, sign as signJWT, verify as verifyJWT } from "jsonwebtoken";
import { NextFunction, Response, Request } from "express";

import config from "../config";
import { TokenResponse } from "../../common/models";
import { RequestError } from "../../common/errors";
import { User } from "../database";

// TODO: move these to a less volatile storage solution
// TODO: allow revoking of authorization_codes, access_tokens, and refresh_tokens
const authorization_codes = new Set<string>();
const access_tokens = new Set<string>();
const refresh_tokens = new Set<string>();

interface AuthorizationTokenPayload extends JwtPayload {
	email?: string;
	scope?: string[];
}

const generateAuthorizationCode = (data: AuthorizationTokenPayload): string => {
	const authorization_code = signJWT(data, config.SECRET, { expiresIn: "5m" });
	authorization_codes.add(authorization_code);
	return authorization_code;
};

const generateTokens = (data: AuthorizationTokenPayload): TokenResponse => {
	const access_token = signJWT(data, config.SECRET, { expiresIn: "5m" });
	const refresh_token = signJWT(data, config.SECRET, { expiresIn: "30m" });
	access_tokens.add(access_token);
	refresh_tokens.add(refresh_token);
	return { access_token, refresh_token, expires_in: 300 };
};

export const authorize = async (
	req: Request<unknown, unknown, { [key: string]: string; response_type?: "code" | "token"; scope?: string }>,
	res: Response
) => {
	// TODO: consider limiting requests per account per time to reduce bruteforce attacks
	try {
		const [authorization_type, authorization_value] = req.headers.authorization.split(" ");
		if (!authorization_value || authorization_type !== "Basic")
			throw new RequestError("Invalid Authorization Header", 401);

		if (!["code", "token"].includes(req.body.response_type)) throw new RequestError("Invalid response_type", 400);

		const [email, password] = Buffer.from(authorization_value, "base64").toString("utf8").split(/:(.*)/);
		if (!email || !password) throw new RequestError("Invalid Authorization Header", 401);

		const users = await User.findAll({ where: { email } });
		if (users.length === 0 || users.length > 1 || users[0].password !== password)
			throw new RequestError("Incorrect credentials", 401);

		// TODO: validate scope and insert into payload
		const payload: AuthorizationTokenPayload = { email, scope: [] };
		if (req.body.response_type === "code") res.status(200).send(generateAuthorizationCode(payload));
		else if (req.body.response_type === "token") res.status(200).json(generateTokens(payload));
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else throw error;
	}
};

export const getTokens = (
	req: Request<
		unknown,
		unknown,
		{
			[key: string]: string;
			code?: string;
			grant_type?: "authorization_code" | "refresh_token";
			refresh_token?: string;
			scope?: string;
		}
	>,
	res: Response
) => {
	// TODO: consider scope (can only reduce scope, not increase
	//       see: https://www.rfc-editor.org/rfc/rfc6749#page-47
	// TODO: consider additional basic client_id + client_secret authentication
	try {
		if (!["authorization_code", "refresh_token"].includes(req.body.grant_type))
			throw new RequestError("Invalid grant_type", 400);

		if (req.body.grant_type === "authorization_code" && !authorization_codes.delete(req.body.code))
			throw new RequestError("Invalid code", 400);

		if (req.body.grant_type === "refresh_token" && !refresh_tokens.delete(req.body.refresh_token))
			throw new RequestError("Invalid refresh_token", 400);

		let token;
		if (req.body.grant_type === "authorization_code") token = req.body.code;
		else if (req.body.grant_type === "refresh_token") token = req.body.refresh_token;

		const payload: AuthorizationTokenPayload = verifyJWT(token, config.SECRET) as JwtPayload;
		if (!payload.email || !payload.scope) throw new RequestError("Malformed code", 400);
		Object.keys(payload).forEach((key) => ["email", "scope"].includes(key) || delete payload[key]);
		res.status(200).json(generateTokens(payload));
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else throw error;
	}
};

export const validateAuthorizeRequest = (
	req: Request<
		unknown,
		unknown,
		unknown,
		{ [key: string]: string; response_type?: "code" | "token"; client_id?: string; redirect_uri?: string }
	>,
	res: Response,
	next: NextFunction
) => {
	// TODO: validate client_id + redirect_uri
	try {
		if (!["code", "token"].includes(req.query.response_type)) throw new RequestError("Invalid response_type", 400);
		next();
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else throw error;
	}
};
