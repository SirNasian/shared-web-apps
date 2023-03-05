import express from "express";
import "dotenv/config";

import { AuthorizeRouter, UserRouter } from "./routes";

const server = express();

server.use("/authorize", AuthorizeRouter);
server.use("/api/user", UserRouter);

server.listen(Number(process.env.PORT ?? 3000), () =>
	console.log(`[${new Date().toLocaleTimeString()}] Server Listening`)
);
