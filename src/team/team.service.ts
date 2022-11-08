import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenUser } from 'src/types';
import { CreateTeamDto } from './dto/createTeam.dto';

@Injectable()
export class TeamService {
    constructor(private prismaService: PrismaService) {}
    
    async getTeam(teamID: string){
        const teamInfo = await this.prismaService.team.findFirst({
            where: {
                id: teamID
            }
        })

        if (!teamInfo) {
            throw new NotFoundException();
        }

        return {
            id: teamInfo.id,
            name: teamInfo.name,
        }
    }

    async createTeam(user: TokenUser, createTeamDto: CreateTeamDto) {
        console.log(user.id)
        const team = await this.prismaService.team.create({
            data: {
                name: createTeamDto.name,
                scrum_master_id: user.id
            }
        });

        createTeamDto.emails.forEach(async (email) => {
            const user = await this.prismaService.user.findFirst({
                where: {
                    email: email
                }
            });
            
            if (!user) {
                throw new NotFoundException({
                    missing: email
                });
            }

            await this.prismaService.teamUsers.create({
                data: {
                    team_id: team.id,
                    user_id: user.id
                }
            });
        });
    }
}
