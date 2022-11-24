
export interface Card {
    id: string;
    text: string;
    authorId: string;
    columnId: string;
    groupedTo?: string;
}

export interface User {
    userId: string;
    isReady: boolean;
    isWriting: boolean;
    writingInColumns: string[]
}
export interface ScrumMaster {
    userId: string;
}

export interface RetroColumn {
    id: string;
    color: string;
    name: string;
    description: string;
    cards: Card[];
    teamCardsAmount: number;
    usersWriting: number;
    isWriting: boolean;
}

export interface Vote {
    parentCardId: string;
    voterId: string;
}