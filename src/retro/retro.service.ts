import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RetroService implements OnModuleInit {
  constructor(private prismaService: PrismaService) {}
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
}
