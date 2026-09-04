import { Server, Socket } from 'socket.io';
import { SocketUser } from './SocketAuthMiddleware';
import logger from '../../utils/Logger';

export class UserPresenceSocketHandler {
  static register(
    io: Server,
    socket: Socket,
    userSockets: Map<string, string>,
  ): void {
    const authenticatedUser = socket.data.user as SocketUser;

    socket.on('join', () => {
      const userId = authenticatedUser.id;
      userSockets.set(userId, socket.id);
      logger.info(`User ${userId} joined with socket ${socket.id}`);
      io.emit('user:online', userId);
    });

    // User status check
    socket.on(
      'user:check-status',
      (userIds: string[], callback: (onlineUsers: string[]) => void) => {
        const onlineUsers = userIds.filter((id) => userSockets.has(id));
        callback(onlineUsers);
      },
    );

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          io.emit('user:offline', userId);
          break;
        }
      }
    });
  }
}
