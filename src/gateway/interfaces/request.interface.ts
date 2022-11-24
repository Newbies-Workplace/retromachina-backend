export interface ReadyPayload {
    readyState: true
}

export interface NewCardPayload {
    id: string,
    text: string,
    columnId: string,
    cardId: string,
}

export interface CardAddToCardPayload {
    superiorCardId: string;
    cardId: string;
}

export interface MoveCardToColumnPayload {
    columnId: string;
    cardId: string;
}

export interface DeleteCardPayload {
    cardId: string
}

export interface WriteStatePayload {
    writeState: boolean,
    columnId: string
}

export interface RoomStatePayload {
    roomState: "reflection" | "group" | "vote" | "discuss" | "summary"
}

export interface ChangeTimerPayload {
    timestamp: number
}

export interface VoteOnCardPayload {
    parentCardId: string;
}

export interface RemoveVoteOnCardPayload {
    parentCardId: string;
}

export interface ChangeVoteAmountPayload {
    votesAmount: number;
}