import { Socket } from "socket.io";
export class UserManager {
    users;
    queue;
    constructor() {
        this.users = [];
        this.queue = [];
    }
    addUser(name, socket) {
        this.users.push({
            name, socket
        });
        this.queue.push(socket.id);
        socket.emit("lobby");
    }
}
//# sourceMappingURL=UserManager.js.map