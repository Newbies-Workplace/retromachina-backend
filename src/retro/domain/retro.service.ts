import { Injectable, OnModuleInit } from '@nestjs/common';
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
}
