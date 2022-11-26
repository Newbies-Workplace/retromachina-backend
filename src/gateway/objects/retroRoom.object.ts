import { RoomState } from "src/utils/validator/roomstate.validator";
import { RoomDataResponse } from "../interfaces/response.interface";
import { ScrumMaster, User, Card, RetroColumn, Vote, ActionPoint } from "../interfaces/retroRoom.interface";
import { v4 as uuid } from 'uuid';

export class RetroRoom {
    scrumData: ScrumMaster;
    usersWriting: number = 0;
    usersReady: number = 0;

    users: Map<string, User> = new Map();
    
    createdDate: Date;
    roomState: RoomState;
    maxVotes?: number = 3;
    timerEnds?: number = null;
    discutionCardId = null;

    cards: Card[] = [];
    votes: Vote[] = [];
    actionPoints: ActionPoint[] = [];
    
    constructor(public id: string, public teamId: string, public retroColumns: RetroColumn[]) {
        this.createdDate = new Date();
        this.roomState = "reflection";
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
            discutionCardId: this.discutionCardId,
            actionPoints: this.actionPoints,
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
    
    setVoteAmount(value: number) {
        this.maxVotes = value;

        const userVotes = {};

        const votesCopy = [...this.votes];
        votesCopy.reverse();

        const filteredVotes = votesCopy.filter((vote) => {
            let voter = userVotes[vote.voterId];

            if (!voter) {
                userVotes[vote.voterId] = { amount: 0 };
                voter = userVotes[vote.voterId];
            }

            if (voter.amount < this.maxVotes) {
                userVotes[vote.voterId].amount++;
                return true;
            }

            return false;
        });

        filteredVotes.reverse();
        this.votes = filteredVotes;
    }

    setScrum(userId: string) {
        this.scrumData = {
            userId
        }
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

    addCardToCard(parentCardId: string, cardId: string) {
        const card = this.pushCardToEnd(cardId);
        const parentCard = this.cards.find((card) => card.id === parentCardId);
        const childCards = this.cards.filter((card) => card.parentCardId === cardId);

        childCards.forEach((card) => {
            this.pushCardToEnd(card.id);
            card.parentCardId = parentCardId;
            card.columnId = parentCard.columnId;
        });

        card.parentCardId = parentCardId;
        card.columnId = parentCard.columnId;
    }

    addVote(userId: string, parentCardId: string){
        this.votes.unshift({
            parentCardId,
            voterId: userId
        });
    }

    addActionPoint(text: string, ownerId: string) {
        this.actionPoints.push({
            id: uuid(),
            text,
            ownerId,
            parentCardId: this.discutionCardId
        });
    }

    moveCardToColumn(cardId: string, columnId: string){
        const card = this.pushCardToEnd(cardId);
        card.columnId = columnId;

        if (!card.parentCardId) {
            const groupedCards = this.cards.filter((_card) => _card.parentCardId === card.id);
            groupedCards.forEach((card) => {
                card.columnId = columnId;
            });
        }

        card.parentCardId = null;
    }

    deleteActionPoint(actionPointId: string) {
        this.actionPoints = this.actionPoints.filter((actionPoint) => actionPoint.id !== actionPointId);
    }

    removeVote(userId: string, parentCardId: string) {
        const voteIndex = this.votes.findIndex((vote) => vote.parentCardId === parentCardId && vote.voterId === userId);
        this.votes.splice(voteIndex, 1);
    }

    changeState(roomState: RoomState) {
        // TODO: cośtam się dzieje przy zmianie stanu
        this.timerEnds = null;
        this.roomState = roomState;
        
        this.usersReady = 0;
        for (let [key, user] of this.users) {
            user.isReady = false;
        }
    }

    changeActionPointOwner(actionPointId: string, newOwnerId: string) {
        const actionPoint = this.actionPoints.find((actionPoint) => actionPoint.id === actionPointId);
        actionPoint.ownerId = newOwnerId;
    }

    changeDiscussionCard(cardId: string) {
        this.discutionCardId = cardId;
    }

    pushCardToEnd(cardId: string): Card {
        let card: Card;
        let cardIndex: number;

        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].id === cardId) {
                card = this.cards[i];
                cardIndex = i;
                break;
            }
        }

        this.cards.splice(cardIndex, 1);
        this.cards.push(card);

        return card;
    }
}