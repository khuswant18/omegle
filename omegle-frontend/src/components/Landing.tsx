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
      <div>
        <video autoPlay ref={videoRef}></video>
        <label htmlFor="name-input">Name:</label>
        <input 
          id="name-input"
          type="text"
          placeholder="Enter your name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <button
          onClick={() => {
            setJoined(true);
          }}
        >
          Join
        </button>
      </div>
    );
  }

  return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack}/>
};

export default Landing;
