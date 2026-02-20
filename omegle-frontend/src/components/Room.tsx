import { useEffect, useState, useRef } from "react";
// import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

// const URL = "http://localhost:3000";
const URL = import.meta.env.VITE_API_URL

const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  // const [searchParams, setSearchParams] = useSearchParams();
  // const [socket, setSocket] = useState<null | Socket>(null);
  const [lobby, setLobby] = useState(true);
  // const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
  // const [remoteMediaStream, setRemoteMediaStream] =useState<MediaStream | null>(null);
  // const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null,);
  // const [remoteAudioTrack, setRemoteAudioTrack] =useState<MediaStreamTrack | null>(null);
  // const [remoteVideoTrack, setRemoteVideoTrack] =useState<MediaStreamTrack | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localAudioTrackRef = useRef<MediaStreamTrack | null>(localAudioTrack);
  const localVideoTrackRef = useRef<MediaStreamTrack | null>(localVideoTrack);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());  

  useEffect(() => {
    localAudioTrackRef.current = localAudioTrack;
    localVideoTrackRef.current = localVideoTrack; 
  }, [localAudioTrack, localVideoTrack]);
  // function logout() {
  //   const socket = io(URL);
  //   socket.disconnect(); 
  // }

  useEffect(() => {
    const socket = io(URL);
    socket.emit("join", { name: name });

    ////////
    socket.on("send-offer", async ({ roomId }) => {
      console.log("send offer please");
      // alert("send offer please")  
      setLobby(false);
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      // setSendingPc(pc);
      console.log("localAudioTrack", localAudioTrackRef.current);
      if (localAudioTrackRef.current) {
        console.log("adding audio track");
        pc.addTrack(localAudioTrackRef.current);
      }
      if (localVideoTrackRef.current) {
        console.log("adding video track"); 
        pc.addTrack(localVideoTrackRef.current);
      }

      pc.onicecandidate = (e) => {
        //It fires every time your browser discovers a new ICE candidate
        if (e.candidate) {
          console.log("receiving candidates locally");
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            roomId: roomId,
            type: "sender",  
          });

        }
        
      };

      const remoteStream = remoteStreamRef.current;

      pc.ontrack = e => {
        remoteStream.addTrack(e.track);
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      socket.emit("offer",{
        sdp:offer,
        roomId
      })

      //WHAT they will send (audio/video, codecs, tracks) → SDP
      // HOW to reach each other (IP/ports) → ICE
      // SDP is negotiated first.
      // ICE finds the route after.

      // pc.onnegotiationneeded = async () => {
      //   //It fires when you change something important on the PeerConnection eg:if new track added
      //   console.log("on negotiation neeeded, sending offer");
      //   const sdp = await pc.createOffer();
      //   pc.setLocalDescription(sdp);
      //   socket.emit("offer", {
      //     sdp,
      //     roomId,
      //   });
      // };

    });

    /////////
    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      console.log("offer received"); 
      console.log(roomId);
      setLobby(false);
      // alert("send answer please");
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      if (localAudioTrackRef.current) {
        pc.addTrack(localAudioTrackRef.current);
      }
      if (localVideoTrackRef.current) {
        pc.addTrack(localVideoTrackRef.current);
      }

      pc.onicecandidate = (e) => {
        console.log("inside onicecandidate");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            roomId, 
            type: "receiver",
          });
        } 
      };

      const remoteStream = remoteStreamRef.current;

      //Whenever the OTHER user sends me an audio or video track, give it to me
      pc.ontrack = e => {
        remoteStream.addTrack(e.track);
      };

      await pc.setRemoteDescription(remoteSdp); //This tells your browser:codecs,tracks,directions,ICE credentials
      const sdp = await pc.createAnswer();//Generate my response.
      //Browser now decides:
      // which codecs it supports
      // how it will receive media
      // its ICE ufrag/password 
      await pc.setLocalDescription(sdp); //Save my answer locally and start ICE.
      //After this line 
      // Browser begins:
      // ICE gathering
      // and fires:
      // pc.onicecandidate

      socket.emit("answer", { 
        sdp, 
        roomId,
      });
    });

    socket.on("add-ice-candidate", async ({ candidate, roomId, type }) => {
      console.log("add ice candidate from remote");
      console.log({ candidate, roomId, type });
      // setReceivingPc((pc) => {
      //   pc?.addIceCandidate(candidate);
      //   return pc;
      // });
      await pcRef.current?.addIceCandidate(candidate);
    });

    // setSocket(socket);

    //////////
    socket.on("answer", async ({ roomId, sdp: remoteSdp }) => {
      console.log("from user1", roomId, remoteSdp);
      setLobby(false);
      console.log("connection done"); 
      // setSendingPc((pc) => {
      //   pc?.setRemoteDescription(remoteSdp);
      //   return pc;
      // });
      await pcRef.current?.setRemoteDescription(remoteSdp);
      console.log("loop closed");
    });

    ////////
    socket.on("lobby", () => {
      setLobby(true);
    }); 

    return () => {
      socket.disconnect();
    };
  }, [name]);

  //////////

  useEffect(() => {
    if (localVideoRef.current && localVideoTrackRef.current) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrackRef.current]);
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [lobby]); 

  if (lobby) {
    return <div>Waiting to connect you to someone</div>;
  } 

  return (
    <div>
      Hi {name}
      <video autoPlay muted width={400} height={400} ref={localVideoRef} />
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  ); 
};

export default Room; 
