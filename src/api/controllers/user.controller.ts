import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { RequestError } from "../../common/errors";
import { User } from "../database";

export const CountUsers = async (
	req: Request<unknown, unknown, unknown, { [key: string]: string; id?: string; email?: string }>,
	res: Response
) => {
	Object.keys(req.query).forEach((key: string) => !["id", "email"].includes(key) && delete req.query[key]);
	res.status(200).send(String(await User.count({ where: req.query })));
};

export const RegisterUser = async (
	req: Request<unknown, unknown, { [_: string]: string; email?: string; name?: string; password?: string }>,
	res: Response
) => {
	try {
		const missing = [];
		if (!req.body.email) missing.push("email");
		if (!req.body.name) missing.push("name");
		if (!req.body.password) missing.push("password");
		if (missing.length > 0) throw new RequestError(`Missing mandatory parameter(s): ${missing.join(", ")}`, 400);
		Object.keys(req.body).forEach((key) => ["email", "name", "password"].includes(key) || delete req.body[key]);

		if (!/^\S+@\S+$/.test(req.body.email)) throw new RequestError("Invalid email", 400);
		if (!/^\w([\w ]+\w)?$/.test(req.body.name)) throw new RequestError("Invalid name", 400);

		if ((await User.count({ where: { email: req.body.email } })) > 0)
			throw new RequestError("Email is already in use", 400);

		// TODO: hash password
		await User.create({
			...req.body,
			id: uuidv4(),
		});

		res.sendStatus(200);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else throw error;
	}
};
