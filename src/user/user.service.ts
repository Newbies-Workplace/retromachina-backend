import { ForbiddenException, Injectable } from '@nestjs/common';
import { Team, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenUser } from 'src/types';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService){}

    async getUserMe(user: TokenUser) {
        const userInfo = await this.prismaService.user.findUnique({
            where: {
                google_id: user.google_id
            }
        });

        if (!userInfo) throw new ForbiddenException();

        const userTeams = await this.prismaService.teamUsers.findMany({
            where: {
                user_id: userInfo.id
            }
        });

        const getTeams = new Promise(async (resolve, reject) => {
            let teams = Array();
            for( let userTeam of userTeams) {
                let team: Team = await this.prismaService.team.findFirst({
                    where: {
                        id: userTeam.team_id
                    }
                });

                teams.push({
                    id: team.id,
                    name: team.name
                });
            }
            resolve(teams);
        });

        return {
            nick: userInfo.nick,
            email: userInfo.email,
            avatar_link: userInfo.avatar_link,
            user_type: userInfo.user_type,
            teams: await getTeams
        }
    }

    async getUsers(teamId: string) {
        const teamsInfo = await this.prismaService.teamUsers.findMany({
            where: {
                team_id: teamId,
            }
        });

        const getUsers = new Promise(async (resolve, reject) => {
            let users = Array();
            for( let info of teamsInfo) {
                let user: User = await this.prismaService.user.findFirst({
                    where: {
                        id: info.user_id
                    }
                });

                users.push({
                    user_id: user.id,
                    nick: user.nick,
                    email: user.email,
                    avatar_link: user.avatar_link
                });
            }
            resolve(users);
        });

        return {
            users: await getUsers
        }
    }
}