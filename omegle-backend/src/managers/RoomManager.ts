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
    const roomId = this.generate().toString() 
    this.rooms.set(roomId.toString(),{
        user1,
        user2  
    })
 
    user1.socket.emit("send-offer",{ // this is being sent to the frontend  
        roomId 
    }) 
    
    user2.socket.emit("send-offer",{ 
        roomId
    }) 
    // also both the roomId are same as they both are in same room
  } 
  
  generate() { 
    return GLOBAL_ROOM_ID++;
  }
 // emit means sending 
 // on means listening
 // io.emit sending to all 
 // socket.emit sending to only the client
  onOffer(roomId: string, sdp: string) {
    const user2 = this.rooms.get(roomId)?.user2
    console.log("user2 is " + user2);
    
    user2?.socket.emit("offer",{
        sdp,
        roomId 
    }) 
  }

  

  onAnswer(roomId: string, sdp: string) {
    const user1 = this.rooms.get(roomId)?.user1;
    console.log("user1 is " + user1);

    // Server emit → Client on 
    // Client emit → Server on
    // so whenever we do emit or on on server it goes to client

    user1?.socket.emit("answer", {
      sdp,
      roomId 
    });
  }
} 
