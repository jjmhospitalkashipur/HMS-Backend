import { Router } from "express";
import sharedAuthController from "./shared-auth.controller";

const router = Router();

router.post("/login", sharedAuthController.login);

export default router;
