import { Router, static as expressStatic, urlencoded as expressURLEncoded } from "express";
import { authorize, getTokens, validateAuthorizeRequest } from "../controllers/authorize.controller";

export const AuthorizeRouter = Router();
const bodyURLEncoded = expressURLEncoded({ extended: true });

AuthorizeRouter.post("/token", bodyURLEncoded, getTokens);
AuthorizeRouter.post("/", bodyURLEncoded, authorize);
AuthorizeRouter.get("/", validateAuthorizeRequest);
AuthorizeRouter.use("/", expressStatic("auth-client"));
