import { useEffect, useState, useRef } from "react";
// import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

// const URL = "http://localhost:3000";
const URL = import.meta.env.VITE_API_URL;

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
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },

          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "bcc0c1a296b3d8ef3edf24c6",
            credential: "TKvwICLI6t6tr6Zq",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "bcc0c1a296b3d8ef3edf24c6",
            credential: "TKvwICLI6t6tr6Zq",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "bcc0c1a296b3d8ef3edf24c6",
            credential: "TKvwICLI6t6tr6Zq",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "bcc0c1a296b3d8ef3edf24c6",
            credential: "TKvwICLI6t6tr6Zq",
          },
        ],
      });
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

      pc.ontrack = (e) => {
        console.log("got remote track (sender)", e.track.kind);
        remoteStreamRef.current.addTrack(e.track);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          remoteVideoRef.current.play().catch(console.error);
        }
      };

      // pc.oniceconnectionstatechange = () => {
      //   console.log("ICE connection state:", pc.iceConnectionState);
      //   if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
      //     pc.getStats().then(stats => {
      //       stats.forEach(report => {
      //         if (report.type === "candidate-pair" && report.state === "succeeded") {
      //           console.log("Using:", report.localCandidateId, report.remoteCandidateId);
      //           console.log("report",report)
      //         }
      //       });
      //     });
      //   }
      // };

      pc.oniceconnectionstatechange = async () => {
        if (pc.iceConnectionState === "connected") {
          const stats = await pc.getStats();

          let selectedPair: any;

          stats.forEach((report: any) => {
            if (
              report.type === "candidate-pair" &&
              report.state === "succeeded" &&
              report.nominated
            ) {
              selectedPair = report;
            }
          });
 
          if (selectedPair) {
            const local: any = stats.get(selectedPair.localCandidateId);
            const remote: any = stats.get(selectedPair.remoteCandidateId);

            console.log("LOCAL candidate type:", local?.candidateType);
            console.log("REMOTE candidate type:", remote?.candidateType);
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", {
        sdp: offer,
        roomId,
      });

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
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },

          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "bcc0c1a296b3d8ef3edf24c6",
            credential: "TKvwICLI6t6tr6Zq",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "bcc0c1a296b3d8ef3edf24c6",
            credential: "TKvwICLI6t6tr6Zq",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "bcc0c1a296b3d8ef3edf24c6",
            credential: "TKvwICLI6t6tr6Zq",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "bcc0c1a296b3d8ef3edf24c6",
            credential: "TKvwICLI6t6tr6Zq",
          },
        ],
      });

      //       var myPeerConnection = new RTCPeerConnection({
      //   iceServers: [
      //       {
      //         urls: "stun:stun.relay.metered.ca:80",
      //       },
      //       {
      //         urls: "turn:global.relay.metered.ca:80",
      //         username: "bcc0c1a296b3d8ef3edf24c6",
      //         credential: "TKvwICLI6t6tr6Zq",
      //       },
      //       {
      //         urls: "turn:global.relay.metered.ca:80?transport=tcp",
      //         username: "bcc0c1a296b3d8ef3edf24c6",
      //         credential: "TKvwICLI6t6tr6Zq",
      //       },
      //       {
      //         urls: "turn:global.relay.metered.ca:443",
      //         username: "bcc0c1a296b3d8ef3edf24c6",
      //         credential: "TKvwICLI6t6tr6Zq",
      //       },
      //       {
      //         urls: "turns:global.relay.metered.ca:443?transport=tcp",
      //         username: "bcc0c1a296b3d8ef3edf24c6",
      //         credential: "TKvwICLI6t6tr6Zq",
      //       },
      //   ],
      // });

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

      //Whenever the OTHER user sends me an audio or video track, give it to me
      pc.ontrack = (e) => {
        console.log("got remote track (receiver)", e.track.kind);
        remoteStreamRef.current.addTrack(e.track);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          remoteVideoRef.current.play().catch(console.error);
        }
      };

      pc.oniceconnectionstatechange = async () => {
        if (pc.iceConnectionState === "connected") {
          const stats = await pc.getStats();

          let selectedPair: any;

          stats.forEach((report: any) => {
            if (
              report.type === "candidate-pair" &&
              report.state === "succeeded" &&
              report.nominated
            ) {
              selectedPair = report;
            }
          });

          if (selectedPair) {
            const local: any = stats.get(selectedPair.localCandidateId);
            const remote: any = stats.get(selectedPair.remoteCandidateId);

            console.log("LOCAL candidate type:", local?.candidateType);
            console.log("REMOTE candidate type:", remote?.candidateType);
          }
        }
      };


      await pc.setRemoteDescription(remoteSdp); //This tells your browser:codecs,tracks,directions,ICE credentials
      const sdp = await pc.createAnswer(); //Generate my response.
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
      localVideoRef.current.srcObject = new MediaStream([
        localVideoTrackRef.current,
      ]);
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [lobby]);

  if (lobby) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontSize: "20px",
          color: "#555",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "32px" }}>⏳</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        gap: "20px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{ fontSize: "26px", fontWeight: "bold", color: "#ff6600" }}
        >
          🎥 just for you
        </span>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        {/* Remote video */}
        <div
          style={{
            width: "480px",
            height: "360px",
            background: "#111",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            position: "relative",
          }}
        >
          <video
            autoPlay
            ref={remoteVideoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "12px",
              color: "white",
              fontSize: "13px",
              background: "rgba(0,0,0,0.5)",
              padding: "3px 10px",
              borderRadius: "6px",
            }}
          >
            Stranger
          </div>
        </div>

        <div
          style={{
            width: "480px",
            height: "360px",
            background: "#222",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            position: "relative",
          }}
        >
          <video
            autoPlay
            muted
            ref={localVideoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "12px",
              color: "white",
              fontSize: "13px",
              background: "rgba(0,0,0,0.5)",
              padding: "3px 10px",
              borderRadius: "6px",
            }}
          >
            {name || "You"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 40px",
            background: "#3399ff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Next
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 40px",
            background: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          End
        </button>
      </div>
    </div>
  );
};

export default Room;
