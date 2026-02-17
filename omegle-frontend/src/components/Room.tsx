import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

const Room = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get("name");
  const [socket, setSocket] = useState<null | Socket>(null);
  const [lobby, setLobby] = useState(true); 

  function logout() {
    const socket = io(URL);
    socket.disconnect();
  }   

  useEffect(() => {
    const socket = io(URL);
    
    
    socket.on("send-offer",({roomId})=>{
      alert("send offer please")
      setLobby(false) 
      socket.emit("offer",{
        sdp:"",
        roomId 
      }) 
    })   

    socket.on("offer",({roomId,offer})=>{ 
      setLobby(false)  
      alert("send answer please") 
      socket.emit("answer",{
        roomId,  
        sdp:"" 
      })
 
    }) 

    socket.on("answer",({roomId,answer})=>{
      console.log("from user1",roomId,answer)  
      setLobby(false)
      alert("connection done")  
      
    })  

    socket.on("lobby",()=>{
      setLobby(true) 
    })
  
    socket.on("lobby",() => {
      setLobby(true) 
    })

    return () => {
    socket.disconnect();
  };

  }, []);

  if (lobby) {
    return <div>
      Waiting to connect you to someone
      </div>
  }

  return <div>
        Hi {name}
        <video width={400} height={400} />
        <video width={400} height={400} />
        <button onClick={logout}>End</button>
    </div> 
};

export default Room;
