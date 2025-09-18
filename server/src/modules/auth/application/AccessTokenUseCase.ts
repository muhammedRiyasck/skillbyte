import jwt from "jsonwebtoken";
import { generateAccessToken } from "../../../shared/utils/AccessToken";


export class  AccessTokenUseCase {
  execute(refreshToken: string): string {
    if (!refreshToken) {
      const error = new Error("No refresh token provided") as any;
      error.status=400
      throw error
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      role: string;
    };

    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

    return accessToken;
  }
}
