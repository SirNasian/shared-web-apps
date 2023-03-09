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
const bodyJSON = expressJSON();

ShoppingListRouter.use("/", AuthorizeMiddleware);

ShoppingListRouter.get("/items", getShoppingListItems);
ShoppingListRouter.post("/items", bodyJSON, updateShoppingListItems);
ShoppingListRouter.get("/items/:id", getShoppingListItems);
ShoppingListRouter.put("/items/:id", bodyJSON, updateShoppingListItem);

ShoppingListRouter.get("/:list_id/items", getShoppingListItems);
ShoppingListRouter.post("/:list_id/items", bodyJSON, updateShoppingListItems);
ShoppingListRouter.get("/:list_id/items/:id", getShoppingListItems);
ShoppingListRouter.put("/:list_id/items/:id", bodyJSON, updateShoppingListItem);

ShoppingListRouter.get("/", getShoppingLists);
ShoppingListRouter.post("/", bodyJSON, updateShoppingLists);
ShoppingListRouter.delete("/", bodyJSON, deleteShoppingLists);
ShoppingListRouter.get("/:id", getShoppingLists);
ShoppingListRouter.put("/:id", bodyJSON, updateShoppingList);
ShoppingListRouter.delete("/:id", bodyJSON, deleteShoppingLists);
