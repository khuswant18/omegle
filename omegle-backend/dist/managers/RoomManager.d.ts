import { User } from "./UserManager.js";
export declare class RoomManager {
    private rooms;
    constructor();
    createRoom(user1: User, user2: User): void;
    generate(): number;
    onOffer(roomId: string, sdp: string): void;
    onAnswer(roomId: string, sdp: string): void;
}
//# sourceMappingURL=RoomManager.d.ts.map