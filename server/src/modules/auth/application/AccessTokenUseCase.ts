import jwt from "jsonwebtoken";
import { generateAccessToken } from "../../../shared/utils/AccessToken";


export class  AccessTokenUseCase {
  execute(refreshToken: string): string {
    if (!refreshToken) throw new Error("No refresh token provided");

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      role: string;
    };

    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

    return accessToken;
  }
}
