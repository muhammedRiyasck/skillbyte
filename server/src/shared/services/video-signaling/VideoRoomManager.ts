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

/** Handles video room manager functionality. */
export class VideoRoomManager {
  private videoRooms: Map<string, VideoRoom> = new Map();

  /**
   * Get or create room for the VideoRoomManager entity.
   *
   * @param roomId - The unique identifier for the room.
   * @returns The result of the operation.
   */
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

  /**
   * Get room for the VideoRoomManager entity.
   *
   * @param roomId - The unique identifier for the room.
   * @returns The result of the operation.
   */
  getRoom(roomId: string): VideoRoom | undefined {
    return this.videoRooms.get(roomId);
  }

  /**
   * Add participant for the VideoRoomManager entity.
   *
   * @param roomId - The unique identifier for the room.
   * @param participant - The participant information.
   * @returns The result of the operation.
   */
  addParticipant(roomId: string, participant: VideoRoomParticipant): VideoRoom {
    const room = this.getOrCreateRoom(roomId);
    room.participants.set(participant.userId, participant);
    return room;
  }

  /**
   * Remove participant for the VideoRoomManager entity.
   *
   * @param roomId - The unique identifier for the room.
   * @param userId - The unique identifier for the user.
   * @returns The result of the operation.
   */
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

  /**
   * Get other participants for the VideoRoomManager entity.
   *
   * @param roomId - The unique identifier for the room.
   * @param excludeUserId - The unique identifier for the excludeUser.
   * @returns The result of the operation.
   */
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

  /**
   * Set audio enabled for the VideoRoomManager entity.
   *
   * @param roomId - The unique identifier for the room.
   * @param userId - The unique identifier for the user.
   * @param isEnabled - The is enabled information.
   * @returns The result of the operation.
   */
  setAudioEnabled(roomId: string, userId: string, isEnabled: boolean): boolean {
    const room = this.videoRooms.get(roomId);
    const participant = room?.participants.get(userId);
    if (participant) {
      participant.isAudioEnabled = isEnabled;
      return true;
    }
    return false;
  }

  /**
   * Set video enabled for the VideoRoomManager entity.
   *
   * @param roomId - The unique identifier for the room.
   * @param userId - The unique identifier for the user.
   * @param isEnabled - The is enabled information.
   * @returns The result of the operation.
   */
  setVideoEnabled(roomId: string, userId: string, isEnabled: boolean): boolean {
    const room = this.videoRooms.get(roomId);
    const participant = room?.participants.get(userId);
    if (participant) {
      participant.isVideoEnabled = isEnabled;
      return true;
    }
    return false;
  }

  /**
   * Remove participant by socket id for the VideoRoomManager entity.
   *
   * @param socketId - The unique identifier for the socket.
   * @returns The result of the operation.
   */
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
