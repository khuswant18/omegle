import { Socket } from "socket.io";
export interface User {
    socket: Socket;
    name: string;
}
export declare class UserManager {
    private users;
    private queue;
    constructor();
    addUser(name: string, socket: Socket): void;
}
//# sourceMappingURL=UserManager.d.ts.map