export interface VideoRoomParticipant {
  userId: string;
  socketId: string;
  bookingId: string;
  name: string;
  profileImage?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export interface VideoRoom {
  roomId: string;
  participants: Map<string, VideoRoomParticipant>;
}

export class VideoRoomManager {
  private videoRooms: Map<string, VideoRoom> = new Map();

  getOrCreateRoom(roomId: string): VideoRoom {
    let room = this.videoRooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        participants: new Map(),
      };
      this.videoRooms.set(roomId, room);
    }
    return room;
  }

  getRoom(roomId: string): VideoRoom | undefined {
    return this.videoRooms.get(roomId);
  }

  addParticipant(roomId: string, participant: VideoRoomParticipant): VideoRoom {
    const room = this.getOrCreateRoom(roomId);
    room.participants.set(participant.userId, participant);
    return room;
  }

  removeParticipant(
    roomId: string,
    userId: string,
  ): { participant?: VideoRoomParticipant; remainingCount: number } {
    const room = this.videoRooms.get(roomId);
    if (!room) {
      return { remainingCount: 0 };
    }

    const participant = room.participants.get(userId);
    room.participants.delete(userId);

    const remainingCount = room.participants.size;
    if (remainingCount === 0) {
      this.videoRooms.delete(roomId);
    }

    return { participant, remainingCount };
  }

  getOtherParticipants(
    roomId: string,
    excludeUserId: string,
  ): VideoRoomParticipant[] {
    const room = this.videoRooms.get(roomId);
    if (!room) return [];
    return Array.from(room.participants.values()).filter(
      (p) => p.userId !== excludeUserId,
    );
  }

  setAudioEnabled(roomId: string, userId: string, isEnabled: boolean): boolean {
    const room = this.videoRooms.get(roomId);
    const participant = room?.participants.get(userId);
    if (participant) {
      participant.isAudioEnabled = isEnabled;
      return true;
    }
    return false;
  }

  setVideoEnabled(roomId: string, userId: string, isEnabled: boolean): boolean {
    const room = this.videoRooms.get(roomId);
    const participant = room?.participants.get(userId);
    if (participant) {
      participant.isVideoEnabled = isEnabled;
      return true;
    }
    return false;
  }

  removeParticipantBySocketId(socketId: string): {
    roomId?: string;
    participant?: VideoRoomParticipant;
    remainingCount: number;
  } {
    for (const [roomId, room] of this.videoRooms.entries()) {
      for (const [userId, participant] of room.participants.entries()) {
        if (participant.socketId === socketId) {
          room.participants.delete(userId);
          const remainingCount = room.participants.size;
          if (remainingCount === 0) {
            this.videoRooms.delete(roomId);
          }
          return { roomId, participant, remainingCount };
        }
      }
    }
    return { remainingCount: 0 };
  }
}
