import { ForbiddenException, Injectable } from '@nestjs/common';
import { HttpException, NotFoundException } from '@nestjs/common/exceptions';
import { Team, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenUser } from 'src/types';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getUserMe(user: TokenUser) {
    const userInfo = await this.prismaService.user.findUnique({
      where: {
        google_id: user.google_id,
      },
    });

    if (!userInfo) throw new ForbiddenException();

    const userTeams = await this.prismaService.teamUsers.findMany({
      where: {
        user_id: userInfo.id,
      },
    });

    const getTeams = new Promise(async (resolve, reject) => {
      const teams = [];
      for (const userTeam of userTeams) {
        const team: Team = await this.prismaService.team.findFirst({
          where: {
            id: userTeam.team_id,
          },
        });

        teams.push({
          id: team.id,
          name: team.name,
        });
      }
      resolve(teams);
    });

    return {
      user_id: userInfo.id,
      nick: userInfo.nick,
      email: userInfo.email,
      avatar_link: userInfo.avatar_link,
      user_type: userInfo.user_type,
      teams: await getTeams,
    };
  }

  async getUsers(teamId: string) {
    const teamCheck = await this.prismaService.team.findFirst({
      where: {
        id: teamId,
      },
    });

    if (!teamCheck) throw new NotFoundException();

    const teamsInfo = await this.prismaService.teamUsers.findMany({
      where: {
        team_id: teamId,
      },
    });

    if (teamsInfo.length === 0) throw new NotFoundException();

    const getUsers = new Promise(async (resolve, reject) => {
      const users = [];
      for (const info of teamsInfo) {
        const user: User = await this.prismaService.user.findFirst({
          where: {
            id: info.user_id,
          },
        });

        users.push({
          user_id: user.id,
          nick: user.nick,
          email: user.email,
          avatar_link: user.avatar_link,
        });
      }
      resolve(users);
    });

    return await getUsers;
  }
}
