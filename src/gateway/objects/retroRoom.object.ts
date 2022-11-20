import { TokenUser } from "src/types";

export interface User {
    userId: string,
    isReady?: boolean
}

interface ScrumMaster {
    userId: string
}

export interface RetroColumn {
    id: string,
    color: string,
    name: string,
    description: string
}

type RoomState = "reflection" | "group" | "vote" | "discuss" | "summary";

export class RetroRoom {
    scrumData: ScrumMaster;
    users: Map<string, User> = new Map();
    // retroColumns: Array<RetroColumn> = [];

    createdDate: Date;
    roomState: RoomState;

    maxVotes?: Number;
    timerEnds?: Date;

    constructor(public id: string, public teamId: string, public retroColumns: RetroColumn[]) {
        this.createdDate = new Date();
        this.roomState = "reflection";
    }

    setReady(socketId: string, readyState: boolean){
        const user = this.users.get(socketId);
        user.isReady = readyState;
    }

    addUser(socketId: string, userId: string) {
        const result = Array.from(this.users.entries()).find(([key, localUser]) => {
            return localUser.userId == userId;
        });

        if (!result){
            this.users.set(socketId, {
                userId,
                isReady: false
            });
        } else {
            this.users.delete(result[0]);
            this.users.set(socketId, result[1]);
        }
    }

    setScrum(userId: string) {
        this.scrumData = {
            userId
        }
    }

    getFrontData() {
        console.log(Array.from(this.users.values()));
        return {
            id: this.id,
            teamId: this.teamId,
            createdDate: this.createdDate,
            maxVotes: this.maxVotes,
            roomState: this.roomState,
            retroColumns: this.retroColumns,
            userList: Array.from(this.users.values()).map((user) => {
                const resultUser = {
                    id: user.userId,
                    is_ready: user.isReady
                }
                return resultUser;
            })
        }
    }
}