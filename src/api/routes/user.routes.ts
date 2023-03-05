import { json as ExpressJSON, Router } from "express";

import { CountUsers, RegisterUser } from "../controllers/user.controller";

export const UserRouter = Router();
UserRouter.get("/count", CountUsers);
UserRouter.post("/register", ExpressJSON(), RegisterUser);
