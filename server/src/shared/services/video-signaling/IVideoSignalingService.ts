import { Server, Socket } from 'socket.io';
import { VideoRoomParticipant } from './VideoSignalingService';

export interface IVideoSignalingService {
  registerHandlers(io: Server, socket: Socket): void;
  getRoomParticipants(roomId: string): VideoRoomParticipant[];
}
