import { Server, Socket } from 'socket.io';
import logger from '../../utils/Logger';
import { IVideoSignalingService } from './IVideoSignalingService';

interface VideoRoomParticipant {
  userId: string;
  socketId: string;
  bookingId: string;
  name: string;
  profileImage?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

interface VideoRoom {
  roomId: string;
  participants: Map<string, VideoRoomParticipant>;
}

export class VideoSignalingService implements IVideoSignalingService {
  private videoRooms: Map<string, VideoRoom> = new Map();

  public registerHandlers(io: Server, socket: Socket): void {
    // User joins video room
    socket.on(
      'video:join-room',
      ({
        roomId,
        userId,
        bookingId,
        name,
        profileImage,
      }: {
        roomId: string;
        userId: string;
        bookingId: string;
        name: string;
        profileImage?: string;
      }) => {
        logger.info(`User ${userId} joining video room ${roomId}`);

        // Join socket room
        socket.join(`video:${roomId}`);

        // Get or create video room
        let room = this.videoRooms.get(roomId);
        if (!room) {
          room = {
            roomId,
            participants: new Map(),
          };
          this.videoRooms.set(roomId, room);
        }

        // Add participant
        room.participants.set(userId, {
          userId,
          socketId: socket.id,
          bookingId,
          name,
          profileImage,
          isAudioEnabled: true,
          isVideoEnabled: true,
        });

        // Notify other participants
        const otherParticipants = Array.from(room.participants.values()).filter(
          (p) => p.userId !== userId,
        );

        socket.to(`video:${roomId}`).emit('video:user-joined', {
          userId,
          name,
          profileImage,
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
          `User ${userId} joined video room ${roomId}, total participants: ${room.participants.size}`,
        );
      },
    );

    // User leaves video room
    socket.on(
      'video:leave-room',
      ({ roomId, userId }: { roomId: string; userId: string }) => {
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
        const room = this.videoRooms.get(roomId);
        if (!room) {
          logger.warn(`❌ Room ${roomId} not found for offer`);
          return;
        }

        const targetParticipant = room.participants.get(to);
        if (targetParticipant) {
          const fromUserId = this.getUserIdBySocketId(socket.id, room);
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
        const room = this.videoRooms.get(roomId);
        if (!room) {
          logger.warn(`❌ Room ${roomId} not found for answer`);
          return;
        }

        const targetParticipant = room.participants.get(to);
        if (targetParticipant) {
          const fromUserId = this.getUserIdBySocketId(socket.id, room);
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
        const room = this.videoRooms.get(roomId);
        if (!room) {
          return;
        }

        const targetParticipant = room.participants.get(to);
        if (targetParticipant) {
          const fromUserId = this.getUserIdBySocketId(socket.id, room);
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
        const room = this.videoRooms.get(roomId);
        if (!room) return;

        const participant = room.participants.get(userId);
        if (participant) {
          participant.isAudioEnabled = enabled;
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
        const room = this.videoRooms.get(roomId);
        if (!room) return;

        const participant = room.participants.get(userId);
        if (participant) {
          participant.isVideoEnabled = enabled;
          socket.to(`video:${roomId}`).emit('video:peer-video-toggled', {
            userId,
            enabled,
          });
        }
      },
    );

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket ${socket.id} disconnected, cleaning up video rooms`);
      // Find and remove user from all video rooms
      this.videoRooms.forEach((room, roomId) => {
        const userId = this.getUserIdBySocketId(socket.id, room);
        if (userId) {
          this.handleUserLeaveRoom(socket, roomId, userId);
        }
      });
    });
  }

  private handleUserLeaveRoom(
    socket: Socket,
    roomId: string,
    userId: string,
  ): void {
    const room = this.videoRooms.get(roomId);
    if (!room) return;

    logger.info(`User ${userId} leaving video room ${roomId}`);

    // Remove participant
    room.participants.delete(userId);

    // Leave socket room
    socket.leave(`video:${roomId}`);

    // Notify others
    socket.to(`video:${roomId}`).emit('video:user-left', { userId });

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.videoRooms.delete(roomId);
      logger.info(`Video room ${roomId} deleted (empty)`);
    }
  }

  private getUserIdBySocketId(
    socketId: string,
    room: VideoRoom,
  ): string | null {
    for (const [userId, participant] of room.participants.entries()) {
      if (participant.socketId === socketId) {
        return userId;
      }
    }
    return null;
  }

  public getRoomParticipants(roomId: string): VideoRoomParticipant[] {
    const room = this.videoRooms.get(roomId);
    return room ? Array.from(room.participants.values()) : [];
  }
}
