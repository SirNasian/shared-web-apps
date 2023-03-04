import express from "express";
import "dotenv";

const server = express();
server.get("/", (req, res) => res.status(200).send(`Hello "${req.hostname}"`));
server.listen(Number(process.env.PORT ?? 3000));
