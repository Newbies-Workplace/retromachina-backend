import { TokenUser } from "src/types";

interface User {
    socketId: string,
    data: TokenUser
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

    addUser(socketId: string, user: TokenUser) {
        this.users.set(socketId, {
            socketId,
            data: user
        });
    }

    setScrum(user: TokenUser) {
        this.scrumData = {
            userId: user.id
        }
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
                const resultUser = {
                    id: user.data.id,
                    nick: user.data.nick,
                    email: user.data.email,
                    avatar_link: user.data.email
                }
                return resultUser;
            })
        }
    }
}