import { useState, useEffect, useRef } from "react";
import Room from "./Room";

const Landing = () => {
  const [name, setName] = useState("");
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [joined, setJoined] = useState(false);
  
  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    }); 
    // MediaStream -> just a bridge between your computer and webrtc it contains video and audio track
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    setLocalVideoTrack(videoTrack);
    setLocalAudioTrack(audioTrack); 
 
    if (!videoRef.current) {
      return;
    } 

    videoRef.current.srcObject = new MediaStream([videoTrack]);
    console.log("videoRef",videoRef)
    console.log("videoRef.current.srcObject",videoRef.current.srcObject)
    videoRef.current.play();
  };

  useEffect(() => {
    const initializeCamera = async () => {
      if (videoRef && videoRef.current) {
        getCam(); 
      }
    };
    initializeCamera();
  }, [videoRef]);  

  if (!joined) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "20px",
        padding: "20px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#ff6600" }}>Just for you</span>
        </div>

        {/* Camera preview */}
        <div style={{
          width: "480px",
          height: "320px",
          background: "#222",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          <video
            autoPlay
            muted
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Name input + join */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
              outline: "none",
              width: "220px",
            }}
          />
          <button
            onClick={() => setJoined(true)}
            style={{
              padding: "12px 28px",
              background: "#3399ff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />;
};

export default Landing;
