import { Server as HttpServer } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import logger from '../../utils/Logger';
import { HttpError } from '../../types/HttpError';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';
import { IVideoSignalingService } from '../video-signaling/IVideoSignalingService';

type SocketUser = JwtPayload & {
  id: string;
  role?: string;
};

export class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;
  private userSockets: Map<string, string> = new Map(); // Map userId to socketId
  private videoSignaling: IVideoSignalingService | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(
    httpServer: HttpServer,
    videoSignaling: IVideoSignalingService,
  ): void {
    this.videoSignaling = videoSignaling;
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL! || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.use((socket: Socket, next) => {
      const token = this.getHandshakeToken(socket);

      if (!token) {
        logger.warn(
          `Socket authentication failed: No token provided for socket ${socket.id}`,
        );
        next(new Error('Authentication failed: token missing'));
        return;
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        if (!this.isSocketUser(decoded)) {
          logger.warn(
            `Socket authentication failed: Invalid token payload for socket ${socket.id}`,
          );
          next(new Error('Authentication failed: invalid token payload'));
          return;
        }

        socket.data.user = decoded;
        next();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        logger.warn(
          `Socket authentication failed: Invalid or expired token for socket ${socket.id}, error: ${errorMessage}`,
        );
        next(new Error('Authentication failed: invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const authenticatedUser = socket.data.user as SocketUser;
      logger.info(
        `New authenticated client connected: ${socket.id} for user ${authenticatedUser.id}`,
      );

      socket.on('join', () => {
        const userId = authenticatedUser.id;
        this.userSockets.set(userId, socket.id);
        logger.info(`User ${userId} joined with socket ${socket.id}`);
        // Broadcast user online status
        this.io?.emit('user:online', userId);
      });

      // User status check
      socket.on(
        'user:check-status',
        (userIds: string[], callback: (onlineUsers: string[]) => void) => {
          const onlineUsers = userIds.filter((id) => this.userSockets.has(id));
          callback(onlineUsers);
        },
      );

      // Chat event handlers
      socket.on('chat:join-conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        logger.info(
          `Socket ${socket.id} joined conversation ${conversationId}`,
        );
      });

      socket.on('chat:leave-conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        logger.info(`Socket ${socket.id} left conversation ${conversationId}`);
      });

      socket.on(
        'chat:typing',
        ({
          conversationId,
          userId,
        }: {
          conversationId: string;
          userId: string;
        }) => {
          socket.to(`conversation:${conversationId}`).emit('chat:user-typing', {
            userId,
            conversationId,
          });
        },
      );

      socket.on(
        'chat:stop-typing',
        ({
          conversationId,
          userId,
        }: {
          conversationId: string;
          userId: string;
        }) => {
          socket
            .to(`conversation:${conversationId}`)
            .emit('chat:user-stop-typing', {
              userId,
              conversationId,
            });
        },
      );

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            // Broadcast user offline status
            this.io?.emit('user:offline', userId);
            break;
          }
        }
      });

      // Register video signaling handlers
      if (this.io && this.videoSignaling) {
        this.videoSignaling.registerHandlers(this.io, socket);
      }
    });
  }

  private getHandshakeToken(socket: Socket): string | null {
    const token =
      this.getAuthToken(socket.handshake.auth?.token) ??
      this.getCookieToken(socket.handshake.headers.cookie);

    if (!token) {
      return null;
    }

    return token;
  }

  private getAuthToken(token: unknown): string | null {
    if (typeof token !== 'string') {
      return null;
    }

    return this.normalizeToken(token);
  }

  private getCookieToken(cookieHeader: string | undefined): string | null {
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
      return this.normalizeToken(decodeURIComponent(tokenValue));
    } catch {
      return null;
    }
  }

  private normalizeToken(token: string): string | null {
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      return null;
    }

    const tokenWithoutBearer = trimmedToken.startsWith('Bearer ')
      ? trimmedToken.slice('Bearer '.length).trim()
      : trimmedToken;

    return tokenWithoutBearer || null;
  }

  private isSocketUser(decoded: string | JwtPayload): decoded is SocketUser {
    return (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.id === 'string' &&
      decoded.id.trim().length > 0
    );
  }

  public getIO(): Server {
    if (!this.io) {
      throw new HttpError(
        'Socket.io not initialized!',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
    return this.io;
  }

  public emitToUser<T>(userId: string, event: string, data: T): void {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public emitToConversation<T>(
    conversationId: string,
    event: string,
    data: T,
  ): void {
    if (this.io) {
      this.io.to(`conversation:${conversationId}`).emit(event, data);
    }
  }
}
