import { Router } from "express";

import { CountUsers } from "../controllers/user.controller";

export const UserRouter = Router();
UserRouter.get("/count", CountUsers);
