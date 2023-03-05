import express from "express";
import "dotenv/config";

import { UserRouter } from "./routes/user.routes";

const server = express();
const isTruthy = (value: string): boolean => ["yes", "true", "1"].includes(value.toLowerCase());
isTruthy(process.env.SERVE_AUTH_CLIENT ?? "") && server.use("/auth", express.static("auth-client"));

server.use("/api/user", UserRouter);

server.listen(Number(process.env.PORT ?? 3000), () =>
	console.log(`[${new Date().toLocaleTimeString()}] Server Listening`)
);
