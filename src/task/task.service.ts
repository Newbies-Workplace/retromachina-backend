import { Injectable, NotFoundException } from '@nestjs/common';
import { ActionPoint } from 'src/gateway/interfaces/retroRoom.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prismaService: PrismaService) {}

  async getRetroTasks(retroID: string) {
    const retroCheck = await this.prismaService.retrospective.findFirst({
      where: {
        id: retroID,
      },
    });

    if (!retroCheck) throw new NotFoundException('Retrospective not found!');

    const tasks = await this.prismaService.task.findMany({
      where: {
        retro_id: retroID,
      },
    });

    return tasks.map((task) => {
      return {
        id: task.id,
        ownerId: task.owner_id,
        text: task.description,
      };
    });
  }

  async getTeamTasks(teamID: string) {
    const teamCheck = await this.prismaService.team.findFirst({
      where: {
        id: teamID,
      },
    });

    if (!teamCheck) throw new NotFoundException('Team not found!');

    const tasks = await this.prismaService.task.findMany({
      where: {
        team_id: teamID,
      },
    });

    return tasks;
  }
}
