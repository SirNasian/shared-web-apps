import express from "express";

import config from "./config";
import { AuthorizeRouter, UserRouter } from "./routes";

const server = express();

server.use("/authorize", AuthorizeRouter);
server.use("/api/user", UserRouter);

server.listen(config.PORT, () => console.log(`[${new Date().toLocaleTimeString()}] Server Listening`));
