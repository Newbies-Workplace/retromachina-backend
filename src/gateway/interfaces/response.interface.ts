import { RoomState } from "src/utils/validator/roomstate.validator";
import { Card, RetroColumn, User, Vote } from "./retroRoom.interface";


interface UserDataResponse {
    id: string,
    isReady: boolean,
    isWriting: boolean
}

export interface RoomDataResponse {
    id: string,
    teamId: string,
    createdDate: Date,
    maxVotes: number,
    usersReady: number,
    roomState: RoomState,
    timerEnds: number,
    cards: Card[],
    retroColumns: RetroColumn[],
    users: UserDataResponse[]
    votes: Vote[]
}
