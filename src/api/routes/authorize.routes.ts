import { Router, static as ExpressStatic } from "express";
import { ValidateAuthorizeRequest } from "../controllers/authorize.controller";

export const AuthorizeRouter = Router();

AuthorizeRouter.get("/", ValidateAuthorizeRequest);
AuthorizeRouter.use("/", ExpressStatic("auth-client"));
