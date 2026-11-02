import { Request, Response, NextFunction } from "express";
import { APIError } from "@src/shared";
import { AppError } from "@src/libs/errors";
import sharedAuthService from "./shared-auth.service";

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new APIError(400, "Bad Request", "email and password are required."));
    }
    const result = await sharedAuthService.login(email, password);
    return res.success(result, "Login successful");
  } catch (err: any) {
    if (err instanceof APIError) return next(err);
    return next(new AppError(500, "Login failed", err.message));
  }
}

export default { login };
