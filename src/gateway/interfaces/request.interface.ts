export interface ReadyPayload {
    readyState: true
}

export interface NewCardPayload {
    id: string,
    text: string,
    authorId: string,
    columnId: string
}

export interface DeleteCardPayload {
    cardId: string
}

export interface WriteStatePayload {
    writeState: boolean
}

export interface RoomStatePayload {
    roomState: "reflection" | "group" | "vote" | "discuss" | "summary"
}

export interface ChangeTimerPayload {
    seconds: number | null
}