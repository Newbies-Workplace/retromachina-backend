import { Team } from '@prisma/client';
import { TeamResponse } from './dto/team.response';

export const toTeamResponse = (team: Team): TeamResponse => {
  return {
    id: team.id,
    name: team.name,
    scrumMasterId: team.scrum_master_id,
  }
}