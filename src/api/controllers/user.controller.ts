import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { RequestError } from "../../common/errors";
import { User } from "../database";

export const CountUsers = async (
	req: Request<unknown, unknown, unknown, { [key: string]: string | undefined; id?: string; username?: string }>,
	res: Response
) => {
	Object.keys(req.query).forEach((key: string) => !["id", "username"].includes(key) && delete req.query[key]);
	res.status(200).send(String(await User.count({ where: req.query })));
};

export const RegisterUser = async (
	req: Request<
		unknown,
		unknown,
		{ [_: string]: string | undefined; displayname?: string; username?: string; password?: string }
	>,
	res: Response
) => {
	try {
		const missing = [];
		if (!req.body.displayname) missing.push("displayname");
		if (!req.body.username) missing.push("username");
		if (!req.body.password) missing.push("password");
		if (missing.length > 0) throw new RequestError(`Missing mandatory parameter(s): ${missing.join(", ")}`, 400);
		Object.keys(req.body).forEach(
			(key) => ["displayname", "username", "password"].includes(key) || delete req.body[key]
		);

		if (!/^\w([\w. ]*\w)?$/.test(req.body.displayname ?? "")) throw new RequestError("Invalid display name", 400);
		if (!/^\w([\w.]*\w)?$/.test(req.body.username ?? "")) throw new RequestError("Invalid username", 400);

		if ((await User.count({ where: { username: req.body.username } })) > 0)
			throw new RequestError("This username is already taken by another user", 400);

		// TODO: hash password
		await User.create({
			id: uuidv4(),
			displayname: req.body.displayname ?? "",
			username: req.body.username ?? "",
			password: req.body.password ?? "",
		});

		res.sendStatus(200);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else throw error;
	}
};
