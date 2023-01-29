import { Body, Injectable, OnModuleInit } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenUser } from 'src/types';
import { User } from 'src/utils/decorators/user.decorator';
import { v4 as uuid } from 'uuid';
import { RetroColumn } from 'src/gateway/interfaces/retroRoom.interface';
import { GatewayService } from 'src/gateway/gateway.service';

@Injectable()
export class RetroService implements OnModuleInit {
  constructor(private prismaService: PrismaService, private gatewayService: GatewayService) {}
  async onModuleInit() {
    await this.prismaService.retrospective.updateMany({
      data: {
        is_running: false,
      },
    });
  }

  async getRetroDates(teamId: string) {
    const retros = await this.prismaService.retrospective.findMany({
      where: {
        team_id: teamId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return retros;
  }

  async getRetro(retroId: string) {
    const retro = await this.prismaService.retrospective.findFirst({
      where: {
        id: retroId,
      },
    });

    return retro;
  }


  async createRetro(userId: string, @Body() body) {
    const retroId = uuid();
    await this.prismaService.retrospective.create({
      data: {
        id: retroId,
        date: new Date(),
        is_running: true,
        team_id: body.teamId,
      },
    });

    const room = await this.gatewayService.addRetroRoom(
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
