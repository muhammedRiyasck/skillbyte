// Video Call Type Definitions

export interface Participant {
  userId: string;
  name?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export interface VideoRoomState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  connectionState: RTCPeerConnectionState;
  roomId: string;
  participants: Participant[];
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
  from: string;
  to: string;
}

export interface VideoSocketEvents {
  'video:join-room': (data: {
    roomId: string;
    userId: string;
    bookingId: string;
  }) => void;
  'video:leave-room': (data: { roomId: string; userId: string }) => void;
  'video:offer': (data: {
    roomId: string;
    offer: RTCSessionDescriptionInit;
    to: string;
  }) => void;
  'video:answer': (data: {
    roomId: string;
    answer: RTCSessionDescriptionInit;
    to: string;
  }) => void;
  'video:ice-candidate': (data: {
    roomId: string;
    candidate: RTCIceCandidateInit;
    to: string;
  }) => void;
  'video:toggle-audio': (data: {
    roomId: string;
    userId: string;
    enabled: boolean;
  }) => void;
  'video:toggle-video': (data: {
    roomId: string;
    userId: string;
    enabled: boolean;
  }) => void;
}

export interface VideoRoomInfo {
  roomId: string;
  roomUrl: string;
  bookingId: string;
}
