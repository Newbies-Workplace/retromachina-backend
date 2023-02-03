import { Injectable, OnModuleInit } from '@nestjs/common';
import { Body, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { RetroColumn } from 'src/gateway/interfaces/retroRoom.interface';
import { GatewayService } from 'src/gateway/gateway.service';

@Injectable()
export class RetroService implements OnModuleInit {

  constructor(
    private prismaService: PrismaService,
    private gatewayService: GatewayService,
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

  async createRetro(userId: string, @Body() body) {
    const retroId = uuid();

    const retroId = uuid();
    await this.prismaService.retrospective.create({
      data: {
        id: retroId,
        date: new Date(),
        is_running: true,
        team_id: body.teamId,
      },
    });

    const room = await this.retroGateway.addRetroRoom(
      retroId,
      body.teamId,
      body.columns.map((column: RetroColumn) => {
        column.id = uuid();
        column.usersWriting = 0;
        return column;
      }),
    );
    room.setScrum(userId);

    return {
      retro_id: retroId,
    };
  }
}
