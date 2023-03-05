import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { RetroGateway } from '../application/retro.gateway';
import { RetroCreateRequest } from '../application/model/request.interface';

@Injectable()
export class RetroService implements OnModuleInit {

  constructor(
    private prismaService: PrismaService,
    private retroGateway: RetroGateway,
  ) {}

  async onModuleInit() {
    await this.prismaService.retrospective.updateMany({
      data: {
        is_running: false,
      },
    });
  }

  async getRetroDates(teamId: string) {
    return this.prismaService.retrospective.findMany({
      where: {
        team_id: teamId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getRetro(retroId: string) {
    return this.prismaService.retrospective.findFirst({
      where: {
        id: retroId,
      },
    });
  }

  async createRetro(userId: string, request: RetroCreateRequest) {
    const retroId = uuid();
    await this.prismaService.retrospective.create({
      data: {
        id: retroId,
        date: new Date(),
        is_running: true,
        team_id: request.teamId,
      },
    });

    await this.retroGateway.addRetroRoom(
      retroId,
      request.teamId,
      userId,
      request.columns.map((column) => {
        return {
          id: uuid(),
          color: column.color,
          name: column.name,
          description: column.desc,
          cards: [],
          isWriting: false,
          teamCardsAmount: 0
        };
      }),
    );

    return {
      retro_id: retroId,
    };
  }
}
