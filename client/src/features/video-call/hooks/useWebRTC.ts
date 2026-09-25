import { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoSocket } from './useVideoSocket';
import { VideoConnectionState } from '../../../shared/enums/VideoConnectionState';

interface UseWebRTCProps {
  roomId: string;
  userId: string;
  localStream: MediaStream | null;
  iceServers: RTCIceServer[] | null;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}


export const useWebRTC = ({
  roomId,
  userId,
  localStream,
  iceServers,
  onRemoteStream,
  onConnectionStateChange,
}: UseWebRTCProps) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
  const remotePeerIdRef = useRef<string | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<{ name: string; profileImage: string | undefined } | null>(null);

  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);

  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const iceRestartCountRef = useRef(0);
  const iceRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MAX_ICE_RESTARTS = 3;

  const localStreamRef = useRef<MediaStream | null>(localStream);

  const { socket, isConnected, on, off, emit } = useVideoSocket();
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    remotePeerIdRef.current = remotePeerId;
  }, [remotePeerId]);

  /**
   * ICE candidates can arrive while an SDP offer/answer is still being applied.
   * `addIceCandidate` rejects in that state, so keep them until the remote
   * description is available and drain the queue immediately afterwards.
   */
  const addPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    if (!pc.remoteDescription || pendingIceCandidatesRef.current.length === 0) {
      return;
    }

    const pendingCandidates = pendingIceCandidatesRef.current;
    pendingIceCandidatesRef.current = [];

    for (const candidate of pendingCandidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding queued ICE candidate:', error);
      }
    }
  }, []);

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


  useEffect(() => {
    const pc = peerConnectionRef.current;
    if (!pc || !localStream) return;

    const senders = pc.getSenders();
    const videoSender = senders.find((s) => s.track?.kind === 'video');
    const audioSender = senders.find((s) => s.track?.kind === 'audio');

    const newVideoTrack = localStream.getVideoTracks()[0];
    const newAudioTrack = localStream.getAudioTracks()[0];

    if (newVideoTrack) {
      if (videoSender) {
        console.log('Replacing video track');
        videoSender.replaceTrack(newVideoTrack).catch(err => console.error('Error replacing video track:', err));
      } else {
        console.log('Video track found but no sender to replace. Adding track and renegotiating.');
        pc.addTrack(newVideoTrack, localStream);
        renegotiate();
      }
    }
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
  /**
   * Schedules an ICE restart with exponential back-off (1 s, 2 s, 4 s).
   * Bails out after MAX_ICE_RESTARTS attempts to avoid infinite loops.
   * `delayOverride` can be 0 to skip the back-off delay (e.g. from the
   * disconnected grace-period path which already waited 3 s).
   */
  const scheduleIceRestart = useCallback((
    pc: RTCPeerConnection,
    peerId: string,
    delayOverride?: number,
  ) => {
    if (iceRestartCountRef.current >= MAX_ICE_RESTARTS) {
      console.warn(`⛔ Max ICE restarts (${MAX_ICE_RESTARTS}) reached — giving up`);
      return;
    }

    const attempt = iceRestartCountRef.current + 1;
    const delay = delayOverride ?? Math.pow(2, iceRestartCountRef.current) * 1_000;
    console.log(`🔁 Scheduling ICE restart attempt ${attempt}/${MAX_ICE_RESTARTS} in ${delay}ms`);

    iceRestartTimerRef.current = setTimeout(async () => {
      iceRestartTimerRef.current = null;
      if (pc.connectionState === 'connected' || pc.connectionState === 'closed') return;

      iceRestartCountRef.current = attempt;
      console.log(`🔄 ICE restart attempt ${attempt}/${MAX_ICE_RESTARTS}`);

      try {
        const offer = await pc.createOffer({
          iceRestart: true,
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        emit('video:offer', { roomId, offer, to: peerId });
        console.log('✅ Auto ICE restart offer sent');
      } catch (err) {
        console.error('❌ Auto ICE restart failed:', err);
      }
    }, delay);
   
  }, [roomId, emit]);

  const createPeerConnection = useCallback((peerId: string) => {
    if (!iceServers) {
      console.warn('⚠️ Cannot create a peer connection before ICE servers load');
      return null;
    }

    console.log('Creating peer connection for:', peerId);

    if (peerConnectionRef.current) {
      console.log('Closing existing peer connection');
      peerConnectionRef.current.close();
      remoteStreamRef.current = null;
      setRemoteStream(null);
    }

    const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 10 });
    peerConnectionRef.current = pc;
    setRemotePeerId(peerId);


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


    pc.ontrack = (event) => {
      console.log('✅ Received remote track:', event.track.kind);
      const updatedStream = remoteStreamRef.current ?? new MediaStream();
      const incomingTracks = event.streams[0]?.getTracks() ?? [event.track];
      incomingTracks.forEach((track) => {
        if (!updatedStream.getTracks().some((existing) => existing.id === track.id)) {
          updatedStream.addTrack(track);
        }
      });
      remoteStreamRef.current = updatedStream;
      const renderStream = new MediaStream(updatedStream.getTracks());
      setRemoteStream(renderStream);
      onRemoteStream?.(renderStream);
    };


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


    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('🔄 Connection state:', state);
      setConnectionState(state);
      onConnectionStateChange?.(state);

      if (state === 'connected') {

        iceRestartCountRef.current = 0;
        if (iceRestartTimerRef.current !== null) {
          clearTimeout(iceRestartTimerRef.current);
          iceRestartTimerRef.current = null;
        }
      } else if (state === 'failed') {
        scheduleIceRestart(pc, peerId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      console.log('🧊 ICE connection state:', iceState);
      if (iceState === 'disconnected') {
        if (iceRestartTimerRef.current === null) {
          iceRestartTimerRef.current = setTimeout(() => {
            iceRestartTimerRef.current = null;
            if (pc.iceConnectionState === 'disconnected') {
              console.log('🧊 Still disconnected after grace period — triggering ICE restart');
              scheduleIceRestart(pc, peerId, 0); // no extra delay
            }
          }, 3_000);
        }
      } else if (iceState === 'connected' || iceState === 'completed') {
        if (iceRestartTimerRef.current !== null) {
          clearTimeout(iceRestartTimerRef.current);
          iceRestartTimerRef.current = null;
        }
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('📡 ICE gathering state:', pc.iceGatheringState);
    };

    return pc;
  }, [roomId, emit, onRemoteStream, onConnectionStateChange, iceServers, scheduleIceRestart]); // localStreamRef is stable, no need to depend on it

  const createOffer = useCallback(async (peerId: string) => {
    console.log('📤 Creating offer for:', peerId);
    const pc = createPeerConnection(peerId);
    if (!pc) return;

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


  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, from: string) => {
    console.log('📥 Received offer from:', from);
    const pc = createPeerConnection(from);
    if (!pc) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ Set remote description from offer');
      await addPendingIceCandidates(pc);

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
  }, [createPeerConnection, roomId, emit, addPendingIceCandidates]);


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
      await addPendingIceCandidates(pc);
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }, [addPendingIceCandidates]);


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
      setRemoteVideoEnabled((prev) => (peerId === remotePeerIdRef.current ? enabled : prev));
    });

    on<{ userId: string; enabled: boolean }>('video:peer-audio-toggled', ({ userId: peerId, enabled }) => {
      console.log(`🎤 Peer ${peerId} audio toggled: ${enabled}`);
      setRemoteAudioEnabled((prev) => (peerId === remotePeerIdRef.current ? enabled : prev));
    });




    on<{ userId: string; name: string; profileImage?: string; isVideoEnabled?: boolean; isAudioEnabled?: boolean }>('video:user-joined', ({ userId: joinedUserId, name, profileImage, isVideoEnabled, isAudioEnabled }) => {
      console.log('👤 User joined room:', joinedUserId);
      if (joinedUserId !== userId) {
        console.log('📤 I will create an offer to the new user');
        setRemoteParticipant({ name, profileImage });
        if (isVideoEnabled !== undefined) setRemoteVideoEnabled(isVideoEnabled);
        if (isAudioEnabled !== undefined) setRemoteAudioEnabled(isAudioEnabled);

        createOffer(joinedUserId);
      }
    });

    on<{ participants: { userId: string; name: string; profileImage?: string; isVideoEnabled?: boolean; isAudioEnabled?: boolean }[] }>('video:room-joined', ({ participants }) => {
      console.log('🚪 I joined room, existing participants:', participants);
      if (participants.length > 0 && participants[0].userId !== userId) {
        console.log('👥 Waiting for an offer from the existing participant');
        setRemoteParticipant({
          name: participants[0].name,
          profileImage: participants[0].profileImage
        });
        if (participants[0].isVideoEnabled !== undefined) setRemoteVideoEnabled(participants[0].isVideoEnabled);
        if (participants[0].isAudioEnabled !== undefined) setRemoteAudioEnabled(participants[0].isAudioEnabled);

      }
    });

    on<{ userId: string }>('video:user-left', ({ userId: leftUserId }) => {
      console.log('👋 User left:', leftUserId);
      if (leftUserId === remotePeerIdRef.current) {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        setRemoteStream(null);
        remoteStreamRef.current = null;
        setRemoteParticipant(null);
        setRemotePeerId(null);
        remotePeerIdRef.current = null;
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, handleOffer, handleAnswer, handleIceCandidate, userId, on, off]);

  /* ... cleanup ... */

  const restartIce = useCallback(() => {
    const pc = peerConnectionRef.current;
    const peerId = remotePeerIdRef.current;
    if (pc && peerId) {
      console.log('🔄 Manual ICE restart requested...');
      iceRestartCountRef.current = 0; // reset counter for manual restarts
      pc.createOffer({ iceRestart: true, offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc.setLocalDescription(offer).then(() => offer))
        .then((offer) => {
          emit('video:offer', { roomId, offer, to: peerId });
          console.log('✅ Manual ICE restart offer sent');
        })
        .catch((err) => console.error('Error restarting ICE:', err));
    }
  }, [roomId, emit]); // remotePeerIdRef is a stable ref, not needed in deps

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
