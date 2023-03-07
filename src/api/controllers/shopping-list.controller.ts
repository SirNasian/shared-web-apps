import { Response, Request } from "express";

import { RequestError } from "../../common/errors";

export const getShoppingListEditors = (req: Request<{ list_id: string; editor_id?: string }>, res: Response) => {
	try {
		// TODO: implement this
		res.status(501).json({ params: req.params });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};

export const getShoppingListItems = (req: Request<{ list_id: string; item_id?: string }>, res: Response) => {
	try {
		// TODO: implement this
		res.status(501).json({ params: req.params });
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(error.message);
		else if (error instanceof Error) res.status(500).send(error.message);
		else throw error;
	}
};

export const getShoppingLists = (req: Request<{ list_id?: string }>, res: Response) => {
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
	req: Request<{ list_id: string; editor_id?: string }, unknown, { editors?: string[] }>,
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
	req: Request<
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
	req: Request<{ list_id?: string }, unknown, { name: string; public: boolean }>,
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
