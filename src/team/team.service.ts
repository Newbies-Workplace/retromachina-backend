import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTUser } from 'src/auth/jwt/JWTUser';
import { TeamRequest, EditTeamRequest } from './application/model/team.request';
import { Team } from '@prisma/client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TeamService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  async createTeam(user: JWTUser, createTeamDto: TeamRequest): Promise<Team> {
    const team = await this.prismaService.team.create({
      data: {
        name: createTeamDto.name,
        owner_id: user.id,
      },
    });

    await this.prismaService.teamUsers.create({
      data: {
        team_id: team.id,
        user_id: user.id,
        role: 'ADMIN',
      },
    });

    const backlogId = uuid()

    await this.prismaService.board.create({
      data: {
        team_id: team.id,
        default_column_id: backlogId,
        BoardColumns: {
          create: {
            id: backlogId,
            name: 'Backlog',
            color: '#1dd7b2',
            order: 0,
          }
        }
      }
    })

    await this.addUsersToTeamUsers(createTeamDto.emails, team.id, user.id);

    return team
  }

  async editTeam(user: JWTUser, team: Team, editTeamDto: EditTeamRequest): Promise<Team> {
    await this.prismaService.team.update({
      where: {
        id: team.id,
      },
      data: {
        name: editTeamDto.name,
      },
    });

    // Reset users && leave owner untouched
    await this.prismaService.teamUsers.deleteMany({
      where: {
        team_id: team.id,
        NOT: {
          user_id: user.id,
        },
      },
    });

    await this.prismaService.invite.deleteMany({
      where: {
        team_id: team.id,
      },
    });

    // Add users to teamUsers
    await this.addUsersToTeamUsers(editTeamDto.emails, team.id, user.id);

    return team
  }

  async deleteTeam(team: Team) {
    await this.prismaService.team.delete({
      where: {
        id: team.id,
      },
    });
  }

  private async addUsersToTeamUsers(emails: string[], teamId: string, scrumId: string) {
    for (const email of emails) {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        await this.prismaService.invite.create({
          data: {
            email: email,
            team_id: teamId,
            from: scrumId,
          },
        });

        continue;
      }

      await this.prismaService.teamUsers.create({
        data: {
          team_id: teamId,
          user_id: user.id,
        },
      });
    }
  }
}
