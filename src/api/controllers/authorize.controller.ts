import { NextFunction, Response, Request } from "express";

export const ValidateAuthorizeRequest = (
	req: Request<unknown, unknown, unknown, { response_type: "code" | "token" }>,
	res: Response,
	next: NextFunction
) => {
	if (["code", "token"].includes(req.query.response_type)) next();
	else res.status(400).send("Invalid response_type");
};
