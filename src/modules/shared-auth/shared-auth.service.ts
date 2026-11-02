import { APIError } from "@src/shared";
import { comparePassword } from "@src/libs/password";
import { signAccessToken } from "@src/libs/jwt";
import HospitalUserModel from "@src/modules/hospital-auth/models/hospital-user.model";

export interface SharedLoginResult {
  user:        any;
  accessToken: string;
}

class SharedAuthService {
  async login(email: string, password: string): Promise<SharedLoginResult> {
    const user = await HospitalUserModel.findOne({ email, deleted: { $ne: true }, isActive: true }).lean() as any;

    if (!user) throw new APIError(401, "Unauthorized", "Invalid credentials.");

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new APIError(401, "Unauthorized", "Invalid credentials.");

    const accessToken = signAccessToken({ sub: user.userId, role: user.role, type: "hospital" as const });

    return {
      user: { _id: user._id, userId: user.userId, email: user.email, name: user.name, role: user.role },
      accessToken,
    };
  }
}

export default new SharedAuthService();
