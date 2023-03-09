import { Response } from "express";
import { QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { sequelize, ShoppingListItems, ShoppingLists } from "../database";
import { RequestError } from "../../common/errors";
import { AuthorizedRequest } from "../middleware/authorize.middleware";

const checkUserCanViewShoppingList = async (user_id: string, list_id: string): Promise<boolean> =>
	Boolean(
		(
			await sequelize.query<{ visible: number }>(
				`
					SELECT (COUNT(*) > 0) AS visible FROM \`shoppinglist_lists\` \`lists\`
					LEFT JOIN \`shoppinglist_viewers\` \`viewers\` ON (\`viewers\`.\`list_id\` = \`lists\`.\`id\`)
					LEFT JOIN \`shoppinglist_editors\` \`editors\` ON (\`editors\`.\`list_id\` = \`lists\`.\`id\`)
					WHERE (:user_id IN (\`lists\`.\`owner\`, \`viewers\`.\`user_id\`, \`editors\`.\`user_id\`))
					AND   (:list_id = \`lists\`.\`id\`);
				`,
				{
					replacements: { user_id, list_id },
					type: QueryTypes.SELECT,
				}
			)
		)[0].visible
	);

export const getShoppingLists = async (
	req: AuthorizedRequest<{ [key: string]: string; id?: string }>,
	res: Response
) => {
	try {
		const replacements = { list_id: req.params.id, user_id: req.user.id };
		!replacements.list_id && delete replacements.list_id;
		res.status(200).json(
			await sequelize
				.query<ShoppingLists>(
					`
						SELECT \`lists\`.* FROM \`shoppinglist_lists\` \`lists\`
						LEFT JOIN \`shoppinglist_viewers\` \`viewers\` ON (\`viewers\`.\`list_id\` = \`lists\`.\`id\`)
						LEFT JOIN \`shoppinglist_editors\` \`editors\` ON (\`editors\`.\`list_id\` = \`lists\`.\`id\`)
						WHERE (:user_id IN (\`lists\`.\`owner\`, \`viewers\`.\`user_id\`, \`editors\`.\`user_id\`))
						${replacements.list_id ? "AND (:list_id = `lists`.`id`)" : ""};
					`,
					{ replacements, type: QueryTypes.SELECT }
				)
				.then((lists) => (req.params.id ? lists[0] ?? null : lists))
		);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const updateShoppingList = async (
	req: AuthorizedRequest<{ id: string }, unknown, { name?: string; public?: boolean }>,
	res: Response
) => {
	try {
		if (!checkUserCanViewShoppingList(req.user.id, req.params.id)) throw new RequestError("Forbidden", 403);
		if (req.body.name === undefined) throw new RequestError("Missing Field: name", 400);
		const id = await ShoppingLists.upsert({
			id: req.params.id,
			name: req.body.name,
			owner: req.user.id,
			public: Boolean(req.body.public),
		}).then((lists) => lists[0].id);
		res.status(200).send(id);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const updateShoppingLists = async (
	req: AuthorizedRequest<unknown, unknown, { id?: string; name?: string; public?: boolean }[]>,
	res: Response
) => {
	const transaction = await sequelize.transaction();
	try {
		if (!Array.isArray(req.body)) throw new RequestError("Malformed Request", 400);
		const list_ids = await ShoppingLists.bulkCreate(
			req.body.map((list) => {
				if (list.id && !checkUserCanViewShoppingList(req.user.id, list.id)) throw new RequestError("Forbidden", 403);
				if (list.name === undefined) throw new RequestError("Missing Field: name", 400);
				return {
					id: list.id ?? uuidv4(),
					name: list.name,
					owner: req.user.id,
					public: Boolean(list.public),
				};
			}),
			{ updateOnDuplicate: ["id"] }
		).then((lists) => lists.map((list) => list.id));
		transaction.commit();
		res.status(200).json(list_ids);
	} catch (error: unknown) {
		transaction.rollback();
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const deleteShoppingLists = async (
	req: AuthorizedRequest<{ id?: string }, unknown, string[]>,
	res: Response
) => {
	const transaction = await sequelize.transaction();
	try {
		const list_ids = req.params.id ? [req.params.id] : req.body ?? undefined;
		if (!list_ids || !Array.isArray(list_ids)) throw new RequestError("Malformed Request", 400);
		const replacements = { list_ids, user_id: req.user.id };
		const affected_rows = await sequelize
			.query(
				`
					DELETE \`lists\` FROM \`shoppinglist_lists\` \`lists\`
					LEFT JOIN \`shoppinglist_editors\` \`editors\` ON (\`editors\`.\`list_id\` = \`lists\`.\`id\`)
					WHERE (:user_id IN (\`lists\`.\`owner\`, \`editors\`.\`user_id\`))
					${replacements.list_ids ? "AND (`lists`.`id`) IN (:list_ids)" : ""};
				`,
				{ replacements, transaction }
			)
			.then(([metadata]) => (metadata as unknown as { affectedRows: number }).affectedRows);
		if (affected_rows !== list_ids.length) throw new RequestError("Forbidden", 403);
		transaction.commit();
		res.sendStatus(200);
	} catch (error: unknown) {
		transaction.rollback();
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const getShoppingListItems = async (
	req: AuthorizedRequest<{ [key: string]: string; list_id?: string; id?: string }>,
	res: Response
) => {
	try {
		const replacements = { item_id: req.params.id, list_id: req.params.list_id, user_id: req.user.id };
		!replacements.item_id && delete replacements.item_id;
		!replacements.list_id && delete replacements.list_id;
		console.log(replacements);
		res.status(200).json(
			await sequelize
				.query<ShoppingListItems>(
					`
						SELECT \`items\`.* FROM \`shoppinglist_items\` \`items\`
						LEFT JOIN \`shoppinglist_lists\` \`lists\` ON (\`lists\`.\`id\` = \`items\`.\`list_id\`)
						LEFT JOIN \`shoppinglist_viewers\` \`viewers\` ON (\`viewers\`.\`list_id\` = \`lists\`.\`id\`)
						LEFT JOIN \`shoppinglist_editors\` \`editors\` ON (\`editors\`.\`list_id\` = \`lists\`.\`id\`)
						WHERE (:user_id IN (\`lists\`.\`owner\`, \`viewers\`.\`user_id\`, \`editors\`.\`user_id\`))
						${replacements.list_id ? "AND (:list_id = `lists`.`id`)" : ""}
						${replacements.item_id ? "AND (:item_id = `items`.`id`)" : ""};
					`,
					{ replacements, type: QueryTypes.SELECT }
				)
				.then((items) => (req.params.id ? items[0] ?? null : items))
		);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const updateShoppingListItem = async (
	req: AuthorizedRequest<
		{ list_id?: string; id: string },
		unknown,
		{ list_id?: string; name?: string; quantity?: number; checked?: boolean }
	>,
	res: Response
) => {
	console.log(req.params);
	try {
		const list_id = req.params.list_id ?? req.body.list_id;
		if (!list_id) throw new RequestError("Missing Field: list_id", 400);
		if (!checkUserCanViewShoppingList(req.user.id, list_id)) throw new RequestError("Forbidden", 403);
		if (!req.body.name) throw new RequestError("Missing Field: name", 400);
		const id = await ShoppingListItems.upsert({
			list_id,
			id: req.params.id,
			name: req.body.name,
			quantity: req.body.quantity ?? 1,
			checked: Boolean(req.body.checked),
		}).then((lists) => lists[0].id);
		res.status(200).send(id);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const updateShoppingListItems = async (
	req: AuthorizedRequest<
		{ list_id?: string },
		unknown,
		{ id?: string; list_id?: string; name?: string; quantity?: number; checked?: boolean }[]
	>,
	res: Response
) => {
	const transaction = await sequelize.transaction();
	try {
		if (!Array.isArray(req.body)) throw new RequestError("Malformed Request", 400);
		const item_ids = await ShoppingLists.bulkCreate(
			req.body.map((item) => {
				const list_id = req.params.list_id ?? item.list_id;
				if (!list_id) throw new RequestError("Missing Field: list_id", 400);
				if (!checkUserCanViewShoppingList(req.user.id, list_id)) throw new RequestError("Forbidden", 403);
				if (!item.name) throw new RequestError("Missing Field: name", 400);
				return {
					list_id,
					id: item.id ?? uuidv4(),
					name: item.name,
					quantity: item.quantity ?? 1,
					checked: Boolean(item.checked),
				};
			}),
			{ updateOnDuplicate: ["id"] }
		).then((items) => items.map((item) => item.id));
		transaction.commit();
		res.status(200).json(item_ids);
	} catch (error: unknown) {
		transaction.rollback();
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};
