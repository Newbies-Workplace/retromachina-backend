export interface ReadyPayload {
  readyState: true;
}

export interface NewCardPayload {
  id: string;
  text: string;
  columnId: string;
  cardId: string;
}

export interface DeleteCardPayload {
  cardId: string;
}

export interface WriteStatePayload {
  writeState: boolean;
  columnId: string;
}

export interface RoomStatePayload {
  roomState: 'reflection' | 'group' | 'vote' | 'discuss' | 'summary';
}

export interface ChangeTimerPayload {
  timestamp: number;
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

export interface CardAddToCardPayload {
  parentCardId: string;
  cardId: string;
}

export interface MoveCardToColumnPayload {
  columnId: string;
  cardId: string;
}

export interface AddActionPointPayload {
  text: string;
  ownerId: string;
}

export interface DeleteActionPointPayload {
  actionPointId: string;
}

export interface ChangeActionPointOwnerPayload {
  actionPointId: string;
  ownerId: string;
}

export interface ChangeCurrentDiscussCardPayload {
  cardId: string;
}
