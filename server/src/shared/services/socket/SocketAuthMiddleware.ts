import jwt, { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import logger from '../../utils/Logger';

export type SocketUser = JwtPayload & {
  id: string;
  role?: string;
};

export class SocketAuthMiddleware {
  static authenticate(socket: Socket, next: (err?: Error) => void): void {
    const token = SocketAuthMiddleware.getHandshakeToken(socket);

    if (!token) {
      logger.warn(
        `Socket authentication failed: No token provided for socket ${socket.id}`,
      );
      next(new Error('Authentication failed: token missing'));
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      if (!SocketAuthMiddleware.isSocketUser(decoded)) {
        logger.warn(
          `Socket authentication failed: Invalid token payload for socket ${socket.id}`,
        );
        next(new Error('Authentication failed: invalid token payload'));
        return;
      }

      socket.data.user = decoded;
      next();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.warn(
        `Socket authentication failed: Invalid or expired token for socket ${socket.id}, error: ${errorMessage}`,
      );
      next(new Error('Authentication failed: invalid token'));
    }
  }

  private static getHandshakeToken(socket: Socket): string | null {
    const token =
      SocketAuthMiddleware.getAuthToken(socket.handshake.auth?.token) ??
      SocketAuthMiddleware.getCookieToken(socket.handshake.headers.cookie);

    if (!token) {
      return null;
    }

    return token;
  }

  private static getAuthToken(token: unknown): string | null {
    if (typeof token !== 'string') {
      return null;
    }

    return SocketAuthMiddleware.normalizeToken(token);
  }

  private static getCookieToken(
    cookieHeader: string | undefined,
  ): string | null {
    if (!cookieHeader) {
      return null;
    }

    const accessToken = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('access_token='));

    if (!accessToken) {
      return null;
    }

    const tokenValue = accessToken.slice('access_token='.length);
    try {
      return SocketAuthMiddleware.normalizeToken(
        decodeURIComponent(tokenValue),
      );
    } catch {
      return null;
    }
  }

  private static normalizeToken(token: string): string | null {
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      return null;
    }

    const tokenWithoutBearer = trimmedToken.startsWith('Bearer ')
      ? trimmedToken.slice('Bearer '.length).trim()
      : trimmedToken;

    return tokenWithoutBearer || null;
  }

  private static isSocketUser(
    decoded: string | JwtPayload,
  ): decoded is SocketUser {
    return (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.id === 'string' &&
      decoded.id.trim().length > 0
    );
  }
}
