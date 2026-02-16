import { User } from "./UserManager.js";

let GLOBAL_ROOM_ID = 1


interface Room {
    user1:User,
    user2:User,

}
export class RoomManager {
    private rooms:Map<string,Room> 
    
    constructor() {
        this.rooms = new Map<string,Room>() 


    }

    createRoom(user1:User,user2:User) {
        const roomId = this.generate() 
        this.rooms.set(roomId.toString(),{
            user1,
            user2 
        }) 

        user1.socket.emit("send-offer",{ 
            roomId
        })


    }


    generate() {
        return GLOBAL_ROOM_ID++;
    }

    onOffer(roomId:string,sdp:string) {
        const user2 = this.rooms.get(roomId)?.user2
        user2?.socket.emit("send",{
            sdp 
        })
    }
    
    onAnswer(roomId:string,sdp:string) {
        const user1 = this.rooms.get(roomId)?.user1
        user1?.socket.emit("accept",{
            sdp 
        })
    } 


         




    }
}
