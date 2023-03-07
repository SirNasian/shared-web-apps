import { Router, json as expressJSON } from "express";
import {
	getShoppingListEditors,
	getShoppingListItems,
	getShoppingLists,
	updateShoppingListEditors,
	updateShoppingListItems,
	updateShoppingLists,
} from "../controllers/shopping-list.controller";

export const ShoppingListRouter = Router();
const bodyJSON = expressJSON();

// TODO: authenticate/authorize with middleware

ShoppingListRouter.post("/", bodyJSON, updateShoppingLists);
ShoppingListRouter.put("/:list_id", bodyJSON, updateShoppingLists);
ShoppingListRouter.get("/", getShoppingLists);
ShoppingListRouter.get("/:list_id", getShoppingLists);

ShoppingListRouter.post("/:list_id/items", bodyJSON, updateShoppingListItems);
ShoppingListRouter.put("/:list_id/items/:item_id", bodyJSON, updateShoppingListItems);
ShoppingListRouter.get("/:list_id/items/", getShoppingListItems);
ShoppingListRouter.get("/:list_id/items/:item_id", getShoppingListItems);

ShoppingListRouter.post("/:list_id/editors", bodyJSON, updateShoppingListEditors);
ShoppingListRouter.put("/:list_id/editors/:editor_id", bodyJSON, updateShoppingListEditors);
ShoppingListRouter.get("/:list_id/editors/", getShoppingListEditors);
ShoppingListRouter.get("/:list_id/editors/:editor_id", getShoppingListEditors);
