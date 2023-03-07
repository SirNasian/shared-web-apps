import { Response } from "express";

import { RequestError } from "../../common/errors";
import { AuthorizedRequest } from "../middleware/authorize.middleware";

export const getShoppingListEditors = (
	req: AuthorizedRequest<{ list_id: string; editor_id?: string }>,
	res: Response
) => {
	try {
		// TODO: implement this
		res.status(501).json({ params: req.params });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};

export const getShoppingListItems = (req: AuthorizedRequest<{ list_id: string; item_id?: string }>, res: Response) => {
	try {
		// TODO: implement this
		res.status(501).json({ params: req.params });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};

export const getShoppingLists = (req: AuthorizedRequest<{ list_id?: string }>, res: Response) => {
	try {
		// TODO: implement this
		res.status(501).json({ params: req.params });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};

export const updateShoppingListEditors = (
	req: AuthorizedRequest<{ list_id: string; editor_id?: string }, unknown, { editors?: string[] }>,
	res: Response
) => {
	try {
		// TODO: implement this
		res.status(501).json({ params: req.params, body: req.body });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};

export const updateShoppingListItems = (
	req: AuthorizedRequest<
		{ list_id: string; item_id?: string },
		unknown,
		{ name: string; quantity: number; checked: boolean; editors?: string[] }
	>,
	res: Response
) => {
	try {
		// TODO: implement this
		res.status(501).json({ params: req.params, body: req.body });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};

export const updateShoppingLists = (
	req: AuthorizedRequest<{ list_id?: string }, unknown, { name: string; public: boolean }>,
	res: Response
) => {
	try {
		// TODO: implement this
		res.status(501).json({ params: req.params, body: req.body });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};
