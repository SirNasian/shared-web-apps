import express from "express";

import config from "./config";
import { AuthorizeRouter, ShoppingListRouter, UserRouter } from "./routes";

const server = express();

server.use("/authorize", AuthorizeRouter);
server.use("/api/users", UserRouter);
server.use("/api/shopping-list", ShoppingListRouter);
config.SERVE_SHOPPING_LIST && server.use("/shopping-list", express.static("shopping-list"));

server.listen(config.PORT, () => console.log(`[${new Date().toLocaleTimeString()}] Server Listening`));
