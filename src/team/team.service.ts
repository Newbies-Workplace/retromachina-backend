import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ForbiddenException,
  HttpException,
  MethodNotAllowedException,
} from '@nestjs/common/exceptions';
import { check } from 'prettier';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenUser } from 'src/types';
import { CreateTeamDto } from './dto/createTeam.dto';
import { EditTeamDto } from './dto/editTeam.dto';

@Injectable()
export class TeamService {
  constructor(private prismaService: PrismaService) {}

  async getTeam(teamID: string) {
    const teamInfo = await this.prismaService.team.findFirst({
      where: {
        id: teamID,
      },
    });

    if (!teamInfo) throw new NotFoundException();

    return {
      id: teamInfo.id,
      name: teamInfo.name,
    };
  }

  async createTeam(user: TokenUser, createTeamDto: CreateTeamDto) {
    const team = await this.prismaService.team.create({
      data: {
        name: createTeamDto.name,
        scrum_master_id: user.id,
      },
    });

    await this.prismaService.teamUsers.create({
      data: {
        team_id: team.id,
        user_id: user.id,
      },
    });

    await this.addUsersToTeamUsers(createTeamDto.emails, team.id, user.id);
  }

  async editTeam(user: TokenUser, teamId: string, editTeamDto: EditTeamDto) {
    const checkTeam = await this.prismaService.team.findFirst({
      where: {
        id: teamId,
      },
    });

    if (!checkTeam) throw new NotFoundException();

    if (checkTeam.scrum_master_id !== user.id)
      throw new MethodNotAllowedException();

    await this.prismaService.team.update({
      where: {
        id: teamId,
      },
      data: {
        name: editTeamDto.name,
      },
    });

    // Reset users && leave scrum untouched
    await this.prismaService.teamUsers.deleteMany({
      where: {
        team_id: checkTeam.id,
        NOT: {
          user_id: user.id,
        },
      },
    });

    await this.prismaService.invite.deleteMany({
      where: {
        team_id: checkTeam.id
      }
    })

    // Add users to teamUsers
    await this.addUsersToTeamUsers(editTeamDto.emails, checkTeam.id, user.id);
  }

  async addUsersToTeamUsers(emails: string[], teamId: string, scrumId: string) {
    emails.forEach(async (email) => {
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
            from_scrum_id: scrumId
          }
        });

        return;
      }

      await this.prismaService.teamUsers.create({
        data: {
          team_id: teamId,
          user_id: user.id,
        },
      });
    });
  }
}
