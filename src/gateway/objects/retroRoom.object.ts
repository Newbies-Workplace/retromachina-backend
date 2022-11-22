import { RoomState } from "src/utils/validator/roomstate.validator";

export interface Card {
    id: string,
    text: string,
    authorId: string,
    columnId: string
}

export interface User {
    userId: string,
    isReady: boolean,
    isWriting: boolean,
}

interface ScrumMaster {
    userId: string
}

export interface RetroColumn {
    id: string,
    color: string,
    name: string,
    description: string
    cards: Card[]
    teamCardsAmount: number;
}

export class RetroRoom {
    scrumData: ScrumMaster;
    usersWriting: number = 0;
    usersReady: number = 0;

    users: Map<string, User> = new Map();

    createdDate: Date;
    roomState: RoomState;

    maxVotes?: Number;
    timerEnds?: Date;

    cards: Card[] = [];

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
                isReady: false,
                isWriting: false
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
        const tempUsers = Array.from(this.users.values())

        return {
            id: this.id,
            teamId: this.teamId,
            createdDate: this.createdDate,
            maxVotes: this.maxVotes,
            usersReady: this.usersReady,
            usersWriting: this.usersWriting !== 0,
            roomState: this.roomState,
            timerEnds: this.timerEnds,
            retroColumns: this.retroColumns.map((column) => {
                column.cards = this.cards.filter((card) => {
                    return card.columnId == column.id;
                });
                column.teamCardsAmount = column.cards.length;
                return column;
            }),
            users: tempUsers.map((user) => {
                const resultUser = {
                    id: user.userId,
                    isReady: user.isReady
                }
                return resultUser;
            })
        }
    }

    changeState(roomState: RoomState) {
        // cośtam się dzieje przy zmianie stanu
        this.timerEnds = null;
        this.roomState = roomState;
    }
}