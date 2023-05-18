import { TeamResponse } from '../../../team/application/model/team.response';

export interface UserResponse {
  id: string
  nick: string
  email: string
  avatar_link: string
}

export interface UserWithTeamsResponse extends UserResponse {
  teams: (TeamResponse & {role: 'USER' | 'ADMIN'})[]
}