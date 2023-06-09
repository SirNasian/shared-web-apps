import { Response, Request } from "express";
import { QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import {
	sequelize,
	ShoppingList,
	ShoppingListItems,
	ShoppingListAttributes,
	ShoppingListItemAttributes,
} from "../database";
import { RequestError } from "../../common/errors";
import { AuthorizedRequest } from "../middleware/authorize.middleware";

const checkUserCanEditShoppingList = async (user_id: string, list_id: string): Promise<boolean> =>
	Boolean(
		(
			await sequelize.query<{ visible: number }>(
				`
					SELECT (COUNT(*) > 0) AS visible FROM \`shoppinglist_lists\` \`lists\`
					LEFT JOIN \`shoppinglist_editors\` \`editors\` ON (\`editors\`.\`list_id\` = \`lists\`.\`id\`)
					WHERE (:user_id IN (\`lists\`.\`owner\`, \`editors\`.\`user_id\`))
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
	req: Request<{ [key: string]: string | undefined; id?: string }>,
	res: Response
) => {
	try {
		const replacements = { list_id: req.params.id, user_id: (req as AuthorizedRequest).user.id };
		!replacements.list_id && delete replacements.list_id;
		res.status(200).json(
			await sequelize
				.query<ShoppingListAttributes>(
					`
						SELECT \`lists\`.* FROM \`shoppinglist_lists\` \`lists\`
						LEFT JOIN \`shoppinglist_viewers\` \`viewers\` ON (\`viewers\`.\`list_id\` = \`lists\`.\`id\`)
						LEFT JOIN \`shoppinglist_editors\` \`editors\` ON (\`editors\`.\`list_id\` = \`lists\`.\`id\`)
						WHERE (
							(\`lists\`.\`public\`) OR
							(:user_id IN (\`lists\`.\`owner\`, \`viewers\`.\`user_id\`, \`editors\`.\`user_id\`))
						)
						${replacements.list_id ? " AND (:list_id = `lists`.`id`)" : ""};
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
	req: Request<{ id?: string }, unknown, { name?: string; public?: boolean }>,
	res: Response
) => {
	try {
		if (!(await checkUserCanEditShoppingList((req as AuthorizedRequest).user.id, req.params.id ?? "")))
			throw new RequestError("Forbidden", 403);
		if (req.body.name === undefined) throw new RequestError("Missing Field: name", 400);
		const id = await ShoppingList.upsert({
			id: req.params.id ?? "",
			name: req.body.name,
			owner: (req as AuthorizedRequest).user.id,
			public: Boolean(req.body.public),
		}).then((lists) => lists[0].id);
		res.status(200).json([id]);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const updateShoppingLists = async (
	req: Request<unknown, unknown, { id?: string; name?: string; public?: boolean }[]>,
	res: Response
) => {
	const transaction = await sequelize.transaction();
	try {
		if (!Array.isArray(req.body)) throw new RequestError("Malformed Request", 400);
		const lists: { id: string; name: string; owner: string; public: boolean }[] = [];
		for (const list of req.body) {
			if (list.id && !(await checkUserCanEditShoppingList((req as AuthorizedRequest).user.id, list.id)))
				throw new RequestError("Forbidden", 403);
			if (list.name === undefined) throw new RequestError("Missing Field: name", 400);
			lists.push({
				id: list.id ?? uuidv4(),
				name: list.name,
				owner: (req as AuthorizedRequest).user.id,
				public: Boolean(list.public),
			});
		}
		const list_ids = await ShoppingList.bulkCreate(lists, {
			updateOnDuplicate: ["name", "public"],
			transaction,
		}).then((lists) => lists.map((list) => list.id));
		transaction.commit();
		res.status(200).json(list_ids);
	} catch (error: unknown) {
		transaction.rollback();
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const deleteShoppingLists = async (req: Request<{ id?: string }, unknown, string[]>, res: Response) => {
	const transaction = await sequelize.transaction();
	try {
		const list_ids = req.params.id ? [req.params.id] : req.body ?? undefined;
		if (!list_ids || !Array.isArray(list_ids)) throw new RequestError("Malformed Request", 400);
		const replacements = { list_ids, user_id: (req as AuthorizedRequest).user.id };
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
	req: Request<{ [key: string]: string | undefined; list_id?: string; id?: string }>,
	res: Response
) => {
	try {
		const replacements = {
			item_id: req.params.id,
			list_id: req.params.list_id,
			user_id: (req as AuthorizedRequest).user.id,
		};
		!replacements.item_id && delete replacements.item_id;
		!replacements.list_id && delete replacements.list_id;
		res.status(200).json(
			await sequelize
				.query<ShoppingListItemAttributes>(
					`
						SELECT \`items\`.* FROM \`shoppinglist_items\` \`items\`
						LEFT JOIN \`shoppinglist_lists\` \`lists\` ON (\`lists\`.\`id\` = \`items\`.\`list_id\`)
						LEFT JOIN \`shoppinglist_viewers\` \`viewers\` ON (\`viewers\`.\`list_id\` = \`lists\`.\`id\`)
						LEFT JOIN \`shoppinglist_editors\` \`editors\` ON (\`editors\`.\`list_id\` = \`lists\`.\`id\`)
						WHERE (
							(\`lists\`.\`public\`) OR
							(:user_id IN (\`lists\`.\`owner\`, \`viewers\`.\`user_id\`, \`editors\`.\`user_id\`))
						)
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
	req: Request<
		{ list_id?: string; id?: string },
		unknown,
		{ list_id?: string; name?: string; quantity?: number; checked?: boolean }
	>,
	res: Response
) => {
	try {
		const list_id = req.params.list_id ?? req.body.list_id;
		if (!list_id) throw new RequestError("Missing Field: list_id", 400);
		if (!(await checkUserCanEditShoppingList((req as AuthorizedRequest).user.id, list_id)))
			throw new RequestError("Forbidden", 403);
		const item = await ShoppingListItems.findOne({ where: { id: req.params.id ?? "" } });
		if (!item && !req.body.name) throw new RequestError("Missing Field: name", 400);
		const id = await ShoppingListItems.upsert({
			list_id,
			id: req.params.id ?? "",
			name: req.body.name ?? item?.name ?? "",
			quantity: req.body.quantity ?? item?.quantity ?? 1,
			checked: Boolean(req.body.checked) ?? item?.checked ?? false,
		}).then((lists) => lists[0].id);
		res.status(200).send([id]);
	} catch (error: unknown) {
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};

export const updateShoppingListItems = async (
	req: Request<
		{ list_id?: string },
		unknown,
		{ id?: string; list_id?: string; name?: string; quantity?: number; checked?: boolean }[]
	>,
	res: Response
) => {
	const transaction = await sequelize.transaction();
	try {
		if (!Array.isArray(req.body)) throw new RequestError("Malformed Request", 400);
		const items: { list_id: string; id: string; name: string; quantity: number; checked: boolean }[] = [];
		for (const item of req.body) {
			const list_id = req.params.list_id ?? item.list_id;
			if (!list_id) throw new RequestError("Missing Field: list_id", 400);
			if (!(await checkUserCanEditShoppingList((req as AuthorizedRequest).user.id, list_id)))
				throw new RequestError("Forbidden", 403);
			if (!item.name) throw new RequestError("Missing Field: name", 400);
			items.push({
				list_id,
				id: item.id ?? uuidv4(),
				name: item.name,
				quantity: item.quantity ?? 1,
				checked: Boolean(item.checked),
			});
		}
		const item_ids = await ShoppingListItems.bulkCreate(items, {
			updateOnDuplicate: ["name", "quantity", "checked"],
			transaction,
		}).then((items) => items.map((item) => item.id));
		transaction.commit();
		res.status(200).json(item_ids);
	} catch (error: unknown) {
		transaction.rollback();
		if (error instanceof RequestError) res.status(error.status).send(`${error.name}: ${error.message}`);
		else if (error instanceof Error) res.status(500).send(`${error.name}: ${error.message}`);
		else throw error;
	}
};
