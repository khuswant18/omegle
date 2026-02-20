import { User } from "./UserManager.js";
export declare class RoomManager {
    private rooms;
    constructor();
    createRoom(user1: User, user2: User): void;
    onOffer(roomId: string, sdp: string, senderSocketId: string): void;
    onAnswer(roomId: string, sdp: string, senderSocketId: string): void;
    onIceCandidates(roomId: string, senderSocketId: string, candidate: any, type: "sender" | "receiver"): void;
    generate(): number;
}
//# sourceMappingURL=RoomManager.d.ts.map