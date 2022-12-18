import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvitesService {
  constructor(private prismaService: PrismaService) {}

  async getInvitesByTeamId(teamId: string) {
    const invites = await this.prismaService.invite.findMany({
      where: {
        team_id: teamId,
      },
    });
    return {
      invites: invites.map((invite) => {
        return {
          email: invite.email,
          team_id: invite.team_id,
        };
      }),
    };
  }
}
