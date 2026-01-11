import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../../utils/Logger';

export class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;
  private userSockets: Map<string, string> = new Map(); // Map userId to socketId

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ALLOWED_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`New client connected: ${socket.id}`);

      socket.on('join', (userId: string) => {
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
    });
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.io not initialized!');
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
