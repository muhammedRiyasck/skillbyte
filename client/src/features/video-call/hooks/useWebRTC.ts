import { useEffect, useRef, useState, useCallback } from 'react';
import { webrtcConfig } from '../utils/webrtcConfig';
import { useVideoSocket } from './useVideoSocket';
import { VideoConnectionState } from '../../../shared/enums/VideoConnectionState';

interface UseWebRTCProps {
  roomId: string;
  userId: string;
  localStream: MediaStream | null;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export const useWebRTC = ({
  roomId,
  userId,
  localStream,
  onRemoteStream,
  onConnectionStateChange,
}: UseWebRTCProps) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
  // State to hold remote participant info
  const [remoteParticipant, setRemoteParticipant] = useState<{ name: string; profileImage: string | undefined } | null>(null);

  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);

  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Use a ref to keep track of the latest localStream without triggering effect re-runs for the connection creation logic
  const localStreamRef = useRef<MediaStream | null>(localStream);

  const { socket, isConnected, on, off, emit } = useVideoSocket();

  // Update ref when localStream changes
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Renegotiate connection (create new offer) using existing PC
  const renegotiate = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !remotePeerId) {
      console.warn('⚠️ Cannot renegotiate: No peer connection or remote peer ID');
      return;
    }

    try {
      console.log('🔄 Renegotiating connection...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      emit('video:offer', {
        roomId,
        offer,
        to: remotePeerId,
      });
      console.log('✅ Renegotiation offer sent');
    } catch (err) {
      console.error('❌ Error during renegotiation:', err);
    }
  }, [roomId, remotePeerId, emit]);

  // Handle track replacement when localStream changes (e.g., toggling video)
  useEffect(() => {
    const pc = peerConnectionRef.current;
    if (!pc || !localStream) return;

    const senders = pc.getSenders();
    const videoSender = senders.find((s) => s.track?.kind === 'video');
    const audioSender = senders.find((s) => s.track?.kind === 'audio');

    const newVideoTrack = localStream.getVideoTracks()[0];
    const newAudioTrack = localStream.getAudioTracks()[0];

    // Replace video track
    if (newVideoTrack) {
      if (videoSender) {
        console.log('Replacing video track');
        videoSender.replaceTrack(newVideoTrack).catch(err => console.error('Error replacing video track:', err));
      } else {
        console.log('Video track found but no sender to replace. Adding track and renegotiating.');
        pc.addTrack(newVideoTrack, localStream);
        renegotiate();
      }
    } else if (videoSender && !newVideoTrack) {
      // Video turned off
      // Optional: explicitly set to null effectively "mutes" it on the wire
      // videoSender.replaceTrack(null);
    }

    // Replace audio track
    if (newAudioTrack && audioSender) {
      if (audioSender.track?.id !== newAudioTrack.id) {
        console.log('Replacing audio track');
        audioSender.replaceTrack(newAudioTrack).catch(err => console.error('Error replacing audio track:', err));
      }
    } else if (newAudioTrack && !audioSender) {
      console.log('Audio track found but no sender. Adding track and renegotiating.');
      pc.addTrack(newAudioTrack, localStream);
      renegotiate();
    }

  }, [localStream, renegotiate]);

  // Create peer connection - should only be called once per peer
  const createPeerConnection = useCallback((peerId: string) => {
    console.log('Creating peer connection for:', peerId);

    // Close existing connection if any
    if (peerConnectionRef.current) {
      console.log('Closing existing peer connection');
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(webrtcConfig);
    peerConnectionRef.current = pc;
    setRemotePeerId(peerId);

    // Add local tracks to peer connection using the REF to get the current stream
    const currentStream = localStreamRef.current;
    if (currentStream) {
      console.log('Adding local tracks to peer connection');
      currentStream.getTracks().forEach((track) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, currentStream);
        }
      });
    } else {
      console.warn('⚠️ No local stream available when creating connection');
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log('✅ Received remote track:', event.track.kind);
      const [stream] = event.streams;
      setRemoteStream(stream);
      onRemoteStream?.(stream);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', peerId);
        emit('video:ice-candidate', {
          roomId,
          candidate: event.candidate.toJSON(),
          to: peerId,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('🔄 Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
      onConnectionStateChange?.(pc.connectionState);
    };

    // Connection timeout logic
    const connectionTimeout = setTimeout(() => {
      if (pc.signalingState !== 'closed') {
        if (pc.connectionState === VideoConnectionState.NEW || pc.connectionState === VideoConnectionState.CONNECTING) {
          console.warn('⚠️ Connection timed out, forcing failed state');
          setConnectionState(VideoConnectionState.FAILED);
          onConnectionStateChange?.(VideoConnectionState.FAILED);
        }
      }
    }, 3000); // 3 seconds timeout

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        clearTimeout(connectionTimeout);
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('📡 ICE gathering state:', pc.iceGatheringState);
    };

    // Process any pending ICE candidates
    if (pendingIceCandidatesRef.current.length > 0) {
      console.log('Processing pending ICE candidates:', pendingIceCandidatesRef.current.length);
      pendingIceCandidatesRef.current.forEach(async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding pending ICE candidate:', error);
        }
      });
      pendingIceCandidatesRef.current = [];
    }

    return pc;
  }, [roomId, emit, onRemoteStream, onConnectionStateChange]); // localStreamRef is stable, no need to depend on it

  // Create offer for the remote peer
  const createOffer = useCallback(async (peerId: string) => {
    console.log('📤 Creating offer for:', peerId);
    const pc = createPeerConnection(peerId);

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      emit('video:offer', {
        roomId,
        offer,
        to: peerId,
      });

      console.log('✅ Offer sent to:', peerId);
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  }, [createPeerConnection, roomId, emit]);

  // Handle incoming offer
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, from: string) => {
    console.log('📥 Received offer from:', from);
    const pc = createPeerConnection(from);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ Set remote description from offer');

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      emit('video:answer', {
        roomId,
        answer,
        to: from,
      });

      console.log('✅ Answer sent to:', from);
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }, [createPeerConnection, roomId, emit]);

  // Handle incoming answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit, from: string) => {
    console.log('📥 Received answer from:', from);
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.warn('⚠️ No peer connection found for answer');
      return;
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Set remote description from answer');
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }, []);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit, from: string) => {
    console.log('📥 Received ICE candidate from:', from);
    const pc = peerConnectionRef.current;

    if (!pc || !pc.remoteDescription) {
      console.warn('⚠️ Peer connection not ready, queueing ICE candidate');
      pendingIceCandidatesRef.current.push(candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ Added ICE candidate');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    console.log('🎯 Registering video signaling handlers');

    // Listen for signaling events
    on<{ offer: RTCSessionDescriptionInit; from: string }>('video:offer', ({ offer, from }) => {
      handleOffer(offer, from);
    });

    on<{ answer: RTCSessionDescriptionInit; from: string }>('video:answer', ({ answer, from }) => {
      handleAnswer(answer, from);
    });

    on<{ candidate: RTCIceCandidateInit; from: string }>('video:ice-candidate', ({ candidate, from }) => {
      handleIceCandidate(candidate, from);
    });

    on<{ userId: string; enabled: boolean }>('video:peer-video-toggled', ({ userId: peerId, enabled }) => {
      console.log(`🎥 Peer ${peerId} video toggled: ${enabled}`);
      setRemoteVideoEnabled((prev) => (peerId === remotePeerId ? enabled : prev));
    });

    on<{ userId: string; enabled: boolean }>('video:peer-audio-toggled', ({ userId: peerId, enabled }) => {
      console.log(`🎤 Peer ${peerId} audio toggled: ${enabled}`);
      setRemoteAudioEnabled((prev) => (peerId === remotePeerId ? enabled : prev));
    });




    on<{ userId: string; name: string; profileImage?: string; isVideoEnabled?: boolean; isAudioEnabled?: boolean }>('video:user-joined', ({ userId: joinedUserId, name, profileImage }) => {
      console.log('👤 User joined room:', joinedUserId);
      // Initiate offer to the new user (we are already in the room)
      if (joinedUserId !== userId) {
        console.log('📤 I will create an offer to the new user');
        setRemoteParticipant({ name, profileImage });

        createOffer(joinedUserId);
      }
    });

    on<{ participants: { userId: string; name: string; profileImage?: string; isVideoEnabled?: boolean; isAudioEnabled?: boolean }[] }>('video:room-joined', ({ participants }) => {
      console.log('🚪 I joined room, existing participants:', participants);
      // If there are existing participants, create offer to first one
      if (participants.length > 0 && participants[0].userId !== userId) {
        console.log('📤 Will create offer to existing participant');
        setRemoteParticipant({
          name: participants[0].name,
          profileImage: participants[0].profileImage
        });
        if (participants[0].isVideoEnabled !== undefined) setRemoteVideoEnabled(participants[0].isVideoEnabled);
        if (participants[0].isAudioEnabled !== undefined) setRemoteAudioEnabled(participants[0].isAudioEnabled);

        createOffer(participants[0].userId);
      }
    });

    on<{ userId: string }>('video:user-left', ({ userId: leftUserId }) => {
      console.log('👋 User left:', leftUserId);
      if (leftUserId === remotePeerId) {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        setRemoteStream(null);
        setRemoteParticipant(null);
        setRemotePeerId(null);
        setConnectionState(VideoConnectionState.NEW);
        setRemoteVideoEnabled(true);
        setRemoteAudioEnabled(true);
      }
    });

    return () => {
      console.log('🧹 Cleaning up video signaling handlers');
      off('video:offer');
      off('video:answer');
      off('video:ice-candidate');
      off('video:user-joined');
      off('video:room-joined');
      off('video:user-left');
      off('video:peer-video-toggled');
      off('video:peer-audio-toggled');
    };
  }, [isConnected, handleOffer, handleAnswer, handleIceCandidate, userId, remotePeerId, createOffer, on, off]);

  /* ... cleanup ... */

  // Restart ICE connection
  const restartIce = useCallback(() => {
    const pc = peerConnectionRef.current;
    if (pc && remotePeerId) {
      console.log('🔄 Restarting ICE connection...');
      // Create a new offer with iceRestart: true
      pc.createOffer({ iceRestart: true, offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => {
          return pc.setLocalDescription(offer).then(() => offer);
        })
        .then((offer) => {
          emit('video:offer', {
            roomId,
            offer,
            to: remotePeerId,
          });
          console.log('✅ ICE restart offer sent');
        })
        .catch((err) => console.error('Error restarting ICE:', err));
    }
  }, [roomId, remotePeerId, emit]);

  return {
    remoteStream,
    connectionState,
    remoteParticipant,
    remoteVideoEnabled,
    remoteAudioEnabled,
    createOffer,
    restartIce,
    socket,
  };
};
