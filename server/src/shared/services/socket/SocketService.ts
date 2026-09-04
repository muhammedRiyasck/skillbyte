import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../../utils/Logger';
import { HttpError } from '../../types/HttpError';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';
import { IVideoSignalingService } from '../video-signaling/IVideoSignalingService';
import { SocketAuthMiddleware, SocketUser } from './SocketAuthMiddleware';
import { ChatSocketHandler } from './ChatSocketHandler';
import { UserPresenceSocketHandler } from './UserPresenceSocketHandler';

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

    // Use authentication middleware
    this.io.use((socket: Socket, next) => {
      SocketAuthMiddleware.authenticate(socket, next);
    });

    this.io.on('connection', (socket: Socket) => {
      const authenticatedUser = socket.data.user as SocketUser;
      logger.info(
        `New authenticated client connected: ${socket.id} for user ${authenticatedUser.id}`,
      );

      // Register presence handlers (join, status check, disconnect)
      UserPresenceSocketHandler.register(this.io!, socket, this.userSockets);

      // Register chat handlers
      ChatSocketHandler.register(this.io!, socket);

      // Register video signaling handlers
      if (this.io && this.videoSignaling) {
        this.videoSignaling.registerHandlers(this.io, socket);
      }
    });
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
