import express from "express";
import dotenv from "dotenv";

dotenv.config();

const server = express();
const isTruthy = (value: string): boolean => ["yes", "true", "1"].includes(value.toLowerCase());
isTruthy(process.env.SERVE_AUTH_CLIENT ?? "") && server.use("/auth", express.static("auth-client"));

server.listen(Number(process.env.PORT ?? 3000), () =>
	console.log(`[${new Date().toLocaleTimeString()}] Server Listening`)
);
