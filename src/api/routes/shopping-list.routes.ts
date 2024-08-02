import { Router, json as expressJSON } from "express";

import {
	deleteShoppingLists,
	getShoppingListItems,
	getShoppingLists,
	updateShoppingList,
	updateShoppingListItem,
	updateShoppingListItems,
	updateShoppingLists,
} from "../controllers/shopping-list.controller";
import { AuthorizeMiddleware } from "../middleware/authorize.middleware";

export const ShoppingListRouter = Router();

ShoppingListRouter.use("/", AuthorizeMiddleware);
ShoppingListRouter.use(expressJSON());

ShoppingListRouter.get("/items", getShoppingListItems);
ShoppingListRouter.post("/items", updateShoppingListItems);
ShoppingListRouter.get("/items/:id", getShoppingListItems);
ShoppingListRouter.put("/items/:id", updateShoppingListItem);

ShoppingListRouter.get("/:list_id/items", getShoppingListItems);
ShoppingListRouter.post("/:list_id/items", updateShoppingListItems);
ShoppingListRouter.get("/:list_id/items/:id", getShoppingListItems);
ShoppingListRouter.put("/:list_id/items/:id", updateShoppingListItem);

ShoppingListRouter.get("/", getShoppingLists);
ShoppingListRouter.post("/", updateShoppingLists);
ShoppingListRouter.delete("/", deleteShoppingLists);
ShoppingListRouter.get("/:id", getShoppingLists);
ShoppingListRouter.put("/:id", updateShoppingList);
ShoppingListRouter.delete("/:id", deleteShoppingLists);
