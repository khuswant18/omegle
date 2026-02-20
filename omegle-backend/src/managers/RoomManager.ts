import { User } from "./UserManager.js";

let GLOBAL_ROOM_ID = 1;

interface Room {
  user1: User;
  user2: User;
}
export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }
 
  createRoom(user1: User, user2: User) {
    console.log("inside createRoom");
    const roomId = this.generate().toString();
    console.log("roomId", roomId);
    this.rooms.set(roomId.toString(), {
      user1, 
      user2,
    }); 
    user1.socket.emit("send-offer", {
      // this is being sent to the frontend
      roomId,
    });

    // user2.socket.emit("send-offer",{
    //     roomId 
    // })
    // also both the roomId are same as they both are in same room
  }
 
  // emit means sending
  // on means listening
  // io.emit sending to all
  // socket.emit sending to only the client
  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    console.log("inside onoffer") 
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1; // if sender is user1 then receive is user2 so that user2 will send the answer back to user1
    receivingUser?.socket.emit("offer", {
      sdp,
      roomId, 
    });
  }

  // Server emit → Client on
  // Client emit → Server on
  // so whenever we do emit or on on server it goes to client

  onAnswer(roomId: string, sdp: string, senderSocketId: string) {
    console.log("inside onAnswer") 
    const room = this.rooms.get(roomId);
    if (!room) { 
      return; 
    } 
    console.log("roomId",roomId) 
    console.log("senderSocketId",senderSocketId)
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1; // now vice versa means receiving user is now user1 if it was not recieving in the offer part
      // console.log("receivingUser",receivingUser)
    receivingUser?.socket.emit("answer", {  
      sdp, 
      roomId, 
    }); 
  } 

  onIceCandidates(
    roomId: string,
    senderSocketId: string,
    candidate: any,
    type: "sender" | "receiver",
  ) {  
    console.log("inside onIcecandidate") 
    const room = this.rooms.get(roomId);
    console.log("roomId",roomId) 
    console.log("candidate",candidate) 
    if (!room) {
      return; 
    }
    const receivingUser =
      room.user1?.socket.id === senderSocketId ? room.user2 : room.user1;
    receivingUser.socket.emit("add-ice-candidate",{candidate,roomId,type})
  } 

  generate() { 
    return GLOBAL_ROOM_ID++;
  }
}
