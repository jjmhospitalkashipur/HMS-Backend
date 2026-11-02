import { Router } from "express";
import hospitalRouter from "./hospital.routes";
import uploadRouter from "@src/modules/upload/upload.routes";
import sharedAuthRouter from "@src/modules/shared-auth/shared-auth.routes";

const router = Router();

router.use("/hospital", hospitalRouter);
router.use("/upload", uploadRouter);
router.use("/shared/auth", sharedAuthRouter);

export default router;
