import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import logger from '../../utils/Logger';
import { SocketUser } from '../socket/SocketAuthMiddleware';
import { IVideoSignalingService } from './IVideoSignalingService';
import { VideoRoomManager, VideoRoomParticipant } from './VideoRoomManager';

export { VideoRoomParticipant } from './VideoRoomManager';

export class VideoSignalingService implements IVideoSignalingService {
  constructor(private roomManager: VideoRoomManager = new VideoRoomManager()) {}

  public registerHandlers(io: Server, socket: Socket): void {
    // User joins video room
    socket.on(
      'video:join-room',
      (
        {
          roomId,
          userId,
          bookingId,
          name,
          profileImage,
          roomToken,
          isAudioEnabled = true,
          isVideoEnabled = true,
        }: {
          roomId: string;
          userId: string;
          bookingId: string;
          name: string;
          profileImage?: string;
          roomToken: string;
          isAudioEnabled?: boolean;
          isVideoEnabled?: boolean;
        },
        callback?: (result: { success: boolean; message?: string }) => void,
      ) => {
        const authenticatedUser = socket.data.user as SocketUser;
        if (
          !this.isValidRoomToken(
            roomToken,
            roomId,
            bookingId,
            userId,
            authenticatedUser.id,
          )
        ) {
          logger.warn(
            `Rejected unauthorized video room join for user ${authenticatedUser.id}`,
          );
          socket.emit('video:join-error', {
            message: 'Video room authorization expired or is invalid',
          });
          callback?.({
            success: false,
            message: 'Video room authorization expired or is invalid',
          });
          return;
        }

        logger.info(`User ${userId} joining video room ${roomId}`);

        socket.join(`video:${roomId}`);

        this.roomManager.addParticipant(roomId, {
          userId,
          socketId: socket.id,
          bookingId,
          name,
          profileImage,
          isAudioEnabled,
          isVideoEnabled,
        });

        const otherParticipants = this.roomManager.getOtherParticipants(
          roomId,
          userId,
        );

        // Notify other participants — include the joining user's A/V state so
        // the already-in-room side immediately knows if they joined muted/camera-off.
        socket.to(`video:${roomId}`).emit('video:user-joined', {
          userId,
          name,
          profileImage,
          isAudioEnabled,
          isVideoEnabled,
          participants: otherParticipants.map((p) => ({
            userId: p.userId,
            name: p.name,
            profileImage: p.profileImage,
            isAudioEnabled: p.isAudioEnabled,
            isVideoEnabled: p.isVideoEnabled,
          })),
        });

        // Send existing participants to the new user
        socket.emit('video:room-joined', {
          roomId,
          participants: otherParticipants.map((p) => ({
            userId: p.userId,
            name: p.name,
            profileImage: p.profileImage,
            isAudioEnabled: p.isAudioEnabled,
            isVideoEnabled: p.isVideoEnabled,
          })),
        });

        logger.info(
          `User ${userId} joined video room ${roomId}, total participants: ${this.roomManager.getRoom(roomId)?.participants.size}`,
        );
        callback?.({ success: true });
      },
    );

    // User leaves video room
    socket.on(
      'video:leave-room',
      ({ roomId, userId }: { roomId: string; userId: string }) => {
        const authenticatedUser = socket.data.user as SocketUser;
        if (authenticatedUser.id !== userId) {
          logger.warn(
            `Rejected video room leave for user ${authenticatedUser.id}`,
          );
          return;
        }
        if (this.getUserIdBySocketId(socket.id, roomId) !== userId) {
          logger.warn(
            `Rejected video room leave from socket outside room ${roomId}`,
          );
          return;
        }
        this.handleUserLeaveRoom(socket, roomId, userId);
      },
    );

    // WebRTC signaling - offer
    socket.on(
      'video:offer',
      ({
        roomId,
        offer,
        to,
      }: {
        roomId: string;
        offer: RTCSessionDescriptionInit;
        to: string;
      }) => {
        const room = this.roomManager.getRoom(roomId);
        if (!room) {
          logger.warn(`❌ Room ${roomId} not found for offer`);
          return;
        }

        const fromUserId = this.getUserIdBySocketId(socket.id, roomId);
        if (fromUserId === 'unknown') {
          logger.warn(`Rejected offer from socket outside room ${roomId}`);
          return;
        }

        const targetParticipant = room.participants.get(to);
        if (targetParticipant) {
          logger.info(
            `📤 Forwarding offer in room ${roomId} from ${fromUserId} to ${to}`,
          );
          io.to(targetParticipant.socketId).emit('video:offer', {
            offer,
            from: fromUserId,
          });
        } else {
          logger.warn(
            `⚠️ Target participant ${to} not found in room ${roomId}`,
          );
        }
      },
    );

    // WebRTC signaling - answer
    socket.on(
      'video:answer',
      ({
        roomId,
        answer,
        to,
      }: {
        roomId: string;
        answer: RTCSessionDescriptionInit;
        to: string;
      }) => {
        const room = this.roomManager.getRoom(roomId);
        if (!room) {
          logger.warn(`❌ Room ${roomId} not found for answer`);
          return;
        }

        const fromUserId = this.getUserIdBySocketId(socket.id, roomId);
        if (fromUserId === 'unknown') {
          logger.warn(`Rejected answer from socket outside room ${roomId}`);
          return;
        }

        const targetParticipant = room.participants.get(to);
        if (targetParticipant) {
          logger.info(
            `📤 Forwarding answer in room ${roomId} from ${fromUserId} to ${to}`,
          );
          io.to(targetParticipant.socketId).emit('video:answer', {
            answer,
            from: fromUserId,
          });
        } else {
          logger.warn(
            `⚠️ Target participant ${to} not found in room ${roomId}`,
          );
        }
      },
    );

    // WebRTC signaling - ICE candidate
    socket.on(
      'video:ice-candidate',
      ({
        roomId,
        candidate,
        to,
      }: {
        roomId: string;
        candidate: RTCIceCandidateInit;
        to: string;
      }) => {
        const room = this.roomManager.getRoom(roomId);
        if (!room) return;

        const fromUserId = this.getUserIdBySocketId(socket.id, roomId);
        if (fromUserId === 'unknown') {
          logger.warn(
            `Rejected ICE candidate from socket outside room ${roomId}`,
          );
          return;
        }

        const targetParticipant = room.participants.get(to);
        if (targetParticipant) {
          logger.info(
            `🧊 Forwarding ICE candidate in room ${roomId} from ${fromUserId} to ${to}`,
          );
          io.to(targetParticipant.socketId).emit('video:ice-candidate', {
            candidate,
            from: fromUserId,
          });
        }
      },
    );

    // Toggle audio
    socket.on(
      'video:toggle-audio',
      ({
        roomId,
        userId,
        enabled,
      }: {
        roomId: string;
        userId: string;
        enabled: boolean;
      }) => {
        if (this.getUserIdBySocketId(socket.id, roomId) !== userId) {
          logger.warn(
            `Rejected audio toggle from socket outside room ${roomId}`,
          );
          return;
        }
        const updated = this.roomManager.setAudioEnabled(
          roomId,
          userId,
          enabled,
        );
        if (updated) {
          socket.to(`video:${roomId}`).emit('video:peer-audio-toggled', {
            userId,
            enabled,
          });
        }
      },
    );

    // Toggle video
    socket.on(
      'video:toggle-video',
      ({
        roomId,
        userId,
        enabled,
      }: {
        roomId: string;
        userId: string;
        enabled: boolean;
      }) => {
        if (this.getUserIdBySocketId(socket.id, roomId) !== userId) {
          logger.warn(
            `Rejected video toggle from socket outside room ${roomId}`,
          );
          return;
        }
        const updated = this.roomManager.setVideoEnabled(
          roomId,
          userId,
          enabled,
        );
        if (updated) {
          socket.to(`video:${roomId}`).emit('video:peer-video-toggled', {
            userId,
            enabled,
          });
        }
      },
    );

    // Socket disconnects
    socket.on('disconnect', () => {
      this.handleSocketDisconnect(socket);
    });
  }

  private handleUserLeaveRoom(
    socket: Socket,
    roomId: string,
    userId: string,
  ): void {
    logger.info(`User ${userId} leaving video room ${roomId}`);

    const { remainingCount } = this.roomManager.removeParticipant(
      roomId,
      userId,
    );

    socket.leave(`video:${roomId}`);
    socket.to(`video:${roomId}`).emit('video:user-left', {
      userId,
    });

    logger.info(
      `User ${userId} left room ${roomId}, remaining participants: ${remainingCount}`,
    );
  }

  private handleSocketDisconnect(socket: Socket): void {
    const { roomId, participant, remainingCount } =
      this.roomManager.removeParticipantBySocketId(socket.id);

    if (roomId && participant) {
      socket.to(`video:${roomId}`).emit('video:user-left', {
        userId: participant.userId,
      });

      logger.info(
        `User ${participant.userId} disconnected from room ${roomId}, remaining: ${remainingCount}`,
      );
    }
  }

  private getUserIdBySocketId(socketId: string, roomId: string): string {
    const room = this.roomManager.getRoom(roomId);
    if (!room) return 'unknown';

    for (const [userId, participant] of room.participants.entries()) {
      if (participant.socketId === socketId) {
        return userId;
      }
    }
    return 'unknown';
  }

  private isValidRoomToken(
    roomToken: string,
    roomId: string,
    bookingId: string,
    userId: string,
    authenticatedUserId: string,
  ): boolean {
    if (!roomToken || userId !== authenticatedUserId) {
      return false;
    }

    try {
      const decoded = jwt.verify(roomToken, process.env.JWT_SECRET!);
      if (typeof decoded === 'string') {
        return false;
      }

      const payload = decoded as JwtPayload & {
        purpose?: string;
        roomId?: string;
        bookingId?: string;
        userId?: string;
      };
      return (
        payload.purpose === 'video-room' &&
        payload.roomId === roomId &&
        payload.bookingId === bookingId &&
        payload.userId === userId
      );
    } catch {
      return false;
    }
  }

  /**
   * Returns all participants currently in a given video room.
   * Delegates to VideoRoomManager (SRP: state lives in the manager).
   */
  public getRoomParticipants(roomId: string): VideoRoomParticipant[] {
    const room = this.roomManager.getRoom(roomId);
    if (!room) return [];
    return Array.from(room.participants.values());
  }
}
