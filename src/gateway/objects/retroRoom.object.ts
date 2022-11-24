import { RoomState } from "src/utils/validator/roomstate.validator";
import { RoomDataResponse } from "../interfaces/response.interface";
import { ScrumMaster, User, Card, RetroColumn, Vote } from "../interfaces/retroRoom.interface";

export class RetroRoom {
    scrumData: ScrumMaster;
    usersWriting: number = 0;
    usersReady: number = 0;

    users: Map<string, User> = new Map();

    createdDate: Date;
    roomState: RoomState;

    maxVotes?: number = 0;
    timerEnds?: number = 0;

    cards: Card[] = [];
    votes: Vote[] = [];

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
                isWriting: false,
                writingInColumns: []
            });
        } else {
            this.users.delete(result[0]);
            this.users.set(socketId, result[1]);
        }
    }

    addVote(userId: string, parentCardId: string){
        this.votes.unshift({
            parentCardId,
            voterId: userId
        });
    }

    removeVote(userId: string, parentCardId: string) {
        const voteIndex = this.votes.findIndex((vote) => vote.parentCardId === parentCardId && vote.voterId === userId);
        this.votes.splice(voteIndex, 1);
    }

    setScrum(userId: string) {
        this.scrumData = {
            userId
        }
    }

    getFrontData() {
        const tempUsers = Array.from(this.users.values())

        const roomData: RoomDataResponse = {
            id: this.id,
            teamId: this.teamId,
            createdDate: this.createdDate,
            maxVotes: this.maxVotes,
            usersReady: this.usersReady,
            roomState: this.roomState,
            timerEnds: this.timerEnds,
            cards: this.cards,
            votes: this.votes,
            retroColumns: this.retroColumns.map((column) => {
                column.cards = this.cards.filter((card) => {
                    return card.columnId == column.id;
                });
                column.isWriting = column.usersWriting > 0;
                column.teamCardsAmount = column.cards.length;
                return column;
            }),
            users: tempUsers.map((user) => {
                return {
                    id: user.userId,
                    isReady: user.isReady,
                    isWriting: user.isWriting
                };
            })
        }

        return roomData;
    }

    changeState(roomState: RoomState) {
        // cośtam się dzieje przy zmianie stanu
        this.timerEnds = null;
        this.roomState = roomState;
    }
}