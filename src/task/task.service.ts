import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prismaService: PrismaService) {}

  async getRetroTasks(retroID: string): Promise<Task[]> {
    const retroCheck = await this.prismaService.retrospective.findFirst({
      where: {
        id: retroID,
      },
    });

    if (!retroCheck) throw new NotFoundException('Retrospective not found!');

    return this.prismaService.task.findMany({
      where: {
        retro_id: retroID,
      },
    });
  }

  async getTeamTasks(teamID: string): Promise<Task[]> {
    const teamCheck = await this.prismaService.team.findFirst({
      where: {
        id: teamID,
      },
    });

    if (!teamCheck) {
      throw new NotFoundException('Team not found!');
    }

    return this.prismaService.task.findMany({
      where: {
        team_id: teamID,
      },
    });
  }
}
