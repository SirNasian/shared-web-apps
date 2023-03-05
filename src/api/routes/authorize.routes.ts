import { Router, static as ExpressStatic, urlencoded as expressURLEncoded } from "express";
import { Authorize, GetTokens, ValidateAuthorizeRequest } from "../controllers/authorize.controller";

export const AuthorizeRouter = Router();
const bodyURLEncoded = expressURLEncoded({ extended: true });

AuthorizeRouter.post("/token", bodyURLEncoded, GetTokens);
AuthorizeRouter.post("/", bodyURLEncoded, Authorize);
AuthorizeRouter.get("/", ValidateAuthorizeRequest);
AuthorizeRouter.use("/", ExpressStatic("auth-client"));
