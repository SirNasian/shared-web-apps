import { Request, Response, NextFunction } from "express";
import { verify as verifyJWT } from "jsonwebtoken";

import config from "../config";
import { RequestError } from "../../common/errors";
import { access_tokens, AuthorizationTokenPayload } from "../controllers/authorize.controller";

export interface AuthorizedRequest<P = { [key: string]: string }, ResBody = object, ReqBody = object, ReqQuery = object>
	extends Request<P, ResBody, ReqBody, ReqQuery> {
	user: {
		name: string;
		scope: string[];
	};
}

export const AuthorizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.headers.authorization) throw new RequestError("Unauthorized", 401);
		const [authorization_type, access_token] = req.headers.authorization.split(" ");
		if (authorization_type !== "Bearer" || !access_token) throw new RequestError("Invalid authorization header", 401);
		if (!access_tokens.has(access_token)) throw new RequestError("Invalid access_token", 401);
		const { username: name, scope } = verifyJWT(access_token, config.SECRET) as AuthorizationTokenPayload;
		(req as AuthorizedRequest).user = { name, scope };
		next();
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};
