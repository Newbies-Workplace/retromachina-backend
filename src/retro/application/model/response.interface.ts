import { RoomState } from 'src/retro/application/roomstate.validator'
import { ActionPoint, Card, RetroColumn, Vote } from './retroRoom.interface'

interface UserDataResponse {
  id: string
  isReady: boolean
}

export interface RoomDataResponse {
  id: string
  teamId: string
  createdDate: Date
  maxVotes: number
  usersReady: number
  roomState: RoomState
  timerEnds: number
  discussionCardId: string | null
  cards: Card[]
  retroColumns: RetroColumn[]
  actionPoints: ActionPoint[]
  users: UserDataResponse[]
  votes: Vote[]
  serverTime: number
}
