import { Server, Socket } from 'socket.io';

export interface IVideoSignalingService {
  registerHandlers(io: Server, socket: Socket): void;
  getRoomParticipants(roomId: string): any[];
}
