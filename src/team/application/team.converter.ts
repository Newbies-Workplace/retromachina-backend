import { Team } from '@prisma/client';
import { TeamResponse } from './model/team.response';

export const toTeamResponse = (team: Team): TeamResponse => {
  return {
    id: team.id,
    name: team.name,
    owner_id: team.owner_id,
  }
}