import { Request, Response } from "express";

import { User } from "../database";

export const CountUsers = async (
	req: Request<unknown, unknown, unknown, { [key: string]: string; id?: string; email?: string }>,
	res: Response
) => {
	Object.keys(req.query).forEach((key: string) => !["id", "email"].includes(key) && delete req.query[key]);
	res.status(200).send(String(await User.count({ where: req.query })));
};
