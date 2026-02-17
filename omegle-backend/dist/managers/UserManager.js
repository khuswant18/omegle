import { RoomManager } from "./RoomManager.js";
// let GLOBAL_ROOM_ID = 1;
export class UserManager {
    users;
    queue;
    roomManager;
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }
    addUser(name, socket) {
        this.users.push({
            name,
            socket,
        });
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue();
        this.initHandlers(socket); // this is not triggering initHandler after this it is just that if client sends "offer" run this else "accept" run this 
    }
    removeUser(socketId) {
        const users = this.users.find(x => x.socket.id === socketId);
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x === socketId);
    }
    clearQueue() {
        console.log("inside clear queues");
        console.log(this.queue.length);
        console.log("queue", this.queue);
        if (this.queue.length < 2) {
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("id is " + id1 + " " + id2);
        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);
        if (!user1 || !user2) {
            return;
        }
        console.log("creating room");
        // console.log("user1",user1)
        // console.log("user2",user2)   
        const room = this.roomManager.createRoom(user1, user2); //this room has two user and a roomId:{user1,user2}
        console.log("room", room);
        this.clearQueue();
    }
    //   generate() {
    //     return GLOBAL_ROOM_ID++;
    //   }
    initHandlers(socket) {
        socket.on("offer", ({ roomId, sdp }) => {
            console.log("got it now asking offer from user2", roomId, sdp);
            this.roomManager.onOffer(roomId, sdp);
        });
        socket.on("answer", ({ roomId, sdp }) => {
            console.log("got it asking answer", roomId, sdp);
            this.roomManager.onAnswer(roomId, sdp);
        });
        // User1 → Server → User2   (offer)
        // User2 → Server → User1   (answer)
    }
}
//# sourceMappingURL=UserManager.js.map