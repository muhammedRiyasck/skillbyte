import { Server, Socket } from 'socket.io';
import logger from '../../utils/Logger';

export class ChatSocketHandler {
  static register(io: Server, socket: Socket): void {
    socket.on('chat:join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);
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
  }
}
