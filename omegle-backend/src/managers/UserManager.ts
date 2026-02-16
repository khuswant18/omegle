import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager.js";

export interface User {
    socket:Socket,
    name:string 
}

let GLOBAL_ROOM_ID = 1

export class UserManager {
    private users:User[]
    private queue:string[]
    private roomManager:RoomManager

    constructor() {
        this.users = [] 
        this.queue = []
        this.roomManager = new RoomManager() 

    } 

    addUser(name:string,socket:Socket) {
        this.users.push({
            name,socket 
        })  
        this.queue.push(socket.id) 
        this.clearQueue() 
    } 

    removeUser(socketId) {
        this.users = this.users.filter(x=>x.socket.id===socketId) 
        this.queue = this.queue.filter(x=>x===socketId) 
    }

    
    clearQueue() {
        if (this.queue.length<2) {
            return 
        }
        const user1 = this.users.find(x=>x.socket.id===this.queue.pop())
        const user2 = this.users.find(x=>x.socket.id===this.queue.pop()) 
        const roomId = this.generate() 

        user1?.socket.emit("new-room",{
            type:"send-offer",
            roomId
        }) 

    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }


    initHandlers(socket:Socket) {
        socket.on("offer",({sdp,roomId}:{sdp:string,roomId:string}) => {
            this.roomManager.onOffer(sdp,roomId)
        })
        socket.on("accept",({sdp,roomId}:{sdp:string,roomId:string})=>{
            this.roomManager.onAnswer(sdp,roomId) 
        })


    }


}  