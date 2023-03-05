import { JwtPayload, sign as signJWT, verify as verifyJWT } from "jsonwebtoken";
import { NextFunction, Response, Request } from "express";
import "dotenv/config";

import { NextMiddleware, RequestError } from "../../common/errors";
import { User } from "../database";

// TODO: move these to a less volatile storage solution
// TODO: allow revoking of authorization_codes, access_tokens, and refresh_tokens
const authorization_codes = new Set<string>();
const access_tokens = new Set<string>();
const refresh_tokens = new Set<string>();

interface AuthorizationToken extends JwtPayload {
	email?: string;
	scope?: string[];
}

export const Authorize = async (
	req: Request<unknown, unknown, { [key: string]: string; response_type?: string; scope?: string }>,
	res: Response,
	next: NextFunction
) => {
	// TODO: consider limiting requests per account per time to reduce bruteforce attacks
	try {
		if (!req.headers.authorization) throw new NextMiddleware();
		const [authorization_type, authorization_value] = req.headers.authorization.split(" ");
		if (!authorization_value || authorization_type !== "Basic")
			throw new RequestError("Invalid Authorization Header", 401);

		if (!["code", "token"].includes(req.body.response_type)) throw new RequestError("Invalid response_type", 400);
		if (req.body.response_type === "token") throw new RequestError("Not Implemented", 501); // TODO: implement this

		const [email, password] = Buffer.from(authorization_value, "base64").toString().split(/:(.*)/);
		if (!email || !password) throw new RequestError("Invalid Authorization Header", 401);

		const users = await User.findAll({ where: { email }});
		if (users.length === 0) throw new RequestError("User not found", 401);
		if (users.length > 1) throw new RequestError("User is ambiguous", 500);
		if (users[0].password !== password) throw new RequestError("Incorrect password", 401);

		// TODO: validate scope and insert into authorization_code

		const authorization_code = signJWT({ email, scope: [] }, process.env.SECRET ?? "secret", { expiresIn: "5m" });
		authorization_codes.add(authorization_code);
		res.status(200).send(authorization_code);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof NextMiddleware) next();
		else throw error;
	}
};

export const GetTokens = (
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
	try {
		if (!["authorization_code", "refresh_token"].includes(req.body.grant_type))
			throw new RequestError("Invalid grant_type", 400);

		if (req.body.grant_type === "authorization_code" && !authorization_codes.delete(req.body.code))
			throw new RequestError("Invalid code", 400);

		if (req.body.grant_type === "refresh_token" && !refresh_tokens.delete(req.body.refresh_token))
			throw new RequestError("Invalid refresh_token", 400);

		let jwt;
		switch (req.body.grant_type) {
			case "authorization_code":
				jwt = req.body.code;
				break;
			case "refresh_token":
				jwt = req.body.refresh_token;
				break;
		}

		const data = verifyJWT(jwt, process.env.SECRET ?? "secret") as AuthorizationToken;
		if (!data.email || !data.scope) throw new RequestError("Malformed code", 400);
		Object.keys(data).forEach((key) => ["email", "scope"].includes(key) || delete data[key]);

		const access_token = signJWT(data, process.env.SECRET ?? "secret", { expiresIn: "5m" });
		const refresh_token = signJWT(data, process.env.SECRET ?? "secret", { expiresIn: "30m" });
		access_tokens.add(access_token);
		refresh_tokens.add(refresh_token);

		res.status(200).json({ access_token, refresh_token });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else throw error;
	}
};

export const ValidateAuthorizeRequest = (
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
