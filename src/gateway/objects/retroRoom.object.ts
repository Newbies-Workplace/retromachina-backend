interface User {
    socketId: string,
    data : {
        userId: string
    }
}

interface ScrumMaster {
    socketId?: string,
    userId: string
}

export interface RetroColumn {
    id: string,
    color: string,
    name: string,
    description: string
}

type RoomState = "reflection" | "group" | "vote" | "summary";

export class RetroRoom {
    private scrumData: ScrumMaster;
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

    addUser(socketId: string, userId: string) {
        this.users.set(userId, {
            socketId,
            data: {
                userId
            }
        });
    }

    setScrum(socketId: string, userId: string) {
        this.scrumData = {
            socketId,
            userId: userId
        }
        this.addUser(socketId, userId);
    }

    getFronData() {
        return {
            id: this.id,
            teamId: this.teamId,
            createdDate: this.createdDate,
            maxVotes: this.maxVotes,
            roomState: this.roomState,
            retroColumns: this.retroColumns,
            userList: Array.from(this.users.values()).map((user) => {
                return user.data;
            })
        }
    }
}