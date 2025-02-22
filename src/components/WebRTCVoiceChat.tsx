import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }
}

interface WebRTCVoiceChatProps {
  onTranscript: (text: string) => void;
  onCallStart: () => void;
  onCallEnd: () => void;
  isCallActive: boolean;
}

const WebRTCVoiceChat: React.FC<WebRTCVoiceChatProps> = ({ onTranscript, onCallStart, onCallEnd, isCallActive }) => {
  // Use 'localhost' for local testing; replace with actual IP if needed.
  const serverIP = window.location.hostname === 'localhost' ? 'localhost' : 'YOUR_SERVER_IP';
  const serverURL = `ws://${serverIP}:5000`;

  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const recognitionRef = useRef<any>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(serverURL);

    ws.current.onopen = () => {
      setConnectionStatus("connected");
      setError("");
      console.log("WebSocket connected to:", serverURL);
    };

    ws.current.onclose = () => {
      setConnectionStatus("disconnected");
      setError("");
    };

    ws.current.onerror = (error) => {
      setError("WebSocket connection error");
      console.error("WebSocket error:", error);
    };

    ws.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "ice-candidate" && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else if (data.type === "offer" && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        ws.current?.send(JSON.stringify({ type: "answer", answer }));
      } else if (data.type === "answer" && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === "transcript") {
        // Optionally receive remote transcripts if desired
        onTranscript(data.text);
      }
    };

    return () => ws.current?.close();
  }, [serverURL, onTranscript]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let text = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(" ");
        onTranscript(text);
        ws.current?.send(JSON.stringify({ type: "transcript", text }));
      };
    } else {
      setError("Speech recognition not supported in this browser");
    }
  }, [onTranscript]);

  const initializePeerConnection = async () => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        ws.current?.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => {
      peerConnectionRef.current?.addTrack(track, stream);
    });
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = stream;
    }
  };

  const startCall = async () => {
    try {
      await initializePeerConnection();
      const offer = await peerConnectionRef.current!.createOffer();
      await peerConnectionRef.current!.setLocalDescription(offer);
      ws.current?.send(JSON.stringify({ type: "offer", offer }));
      recognitionRef.current?.start();
      onCallStart();
    } catch (err: any) {
      setError(`Failed to start call: ${err.message}`);
    }
  };

  const endCall = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    if (localAudioRef.current && localAudioRef.current.srcObject) {
      (localAudioRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    if (remoteAudioRef.current && remoteAudioRef.current.srcObject) {
      (remoteAudioRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    recognitionRef.current?.stop();
    onCallEnd();
  };

  return (
    <div>
      <div>
        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />
      </div>
      <div className="mt-4">
        {!isCallActive ? (
          <button onClick={startCall} className="px-4 py-2 bg-green-500 text-white rounded">
            Start Call
          </button>
        ) : (
          <button onClick={endCall} className="px-4 py-2 bg-red-500 text-white rounded">
            End Call
          </button>
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default WebRTCVoiceChat;
