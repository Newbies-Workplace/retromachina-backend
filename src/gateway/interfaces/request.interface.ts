export interface ReadyPayload {
    readyState: true
}

export interface NewCardPayload {
    id: string,
    text: string,
    columnId: string,
    cardId: string,
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
    timestamp: Date
}