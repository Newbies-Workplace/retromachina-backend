import { RoomState } from 'src/utils/validator/roomstate.validator';
import {
  ActionPoint,
  Card,
  RetroColumn,
  User,
  Vote,
} from './retroRoom.interface';

interface UserDataResponse {
  id: string;
  isReady: boolean;
  isWriting: boolean;
}

export interface RoomDataResponse {
  id: string;
  teamId: string;
  createdDate: Date;
  maxVotes: number;
  usersReady: number;
  roomState: RoomState;
  timerEnds: number;
  discutionCardId: string | null;
  cards: Card[];
  retroColumns: RetroColumn[];
  actionPoints: ActionPoint[];
  users: UserDataResponse[];
  votes: Vote[];
}
