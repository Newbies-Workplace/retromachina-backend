import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards, Header } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GatewayService } from 'src/gateway/gateway.service';
import { RetroService } from './retro.service';
import { v4 as uuid } from 'uuid';
import { RetroColumn } from 'src/gateway/objects/retroRoom.object';
import { User } from 'src/utils/decorators/user.decorator';
import { TokenUser } from 'src/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('retros')
export class RetroController {
  constructor(private retroService: RetroService, private gatewayService: GatewayService, private prismaService: PrismaService) {
    //this.gatewayService.addRetroRoom("0251185b-8d7b-4b44-8891-d7d0274e7cb6", "uhuhu", Array<RetroColumn>());
  }

  @Get()
  @UseGuards(JwtGuard)
  async getRetroDates(@Query('team_id') teamId: string) {
    if (teamId.trim().length === 0)
      throw new BadRequestException('No query param');
    return await this.retroService.getRetroDates(teamId);
  }

  @Post()
  @UseGuards(JwtGuard)
  async createRetro(@User() user: TokenUser, @Body() body) {
    // TODO:
    // Jedno retro na jeden team
    // validacja teamu

    const retroId = uuid();
    await this.prismaService.retrospective.create({
      data: {
        id: retroId,
        date: new Date(),
        is_running: true,
        team_id: body.teamId
      }
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
    room.setScrum(user.id);

    return {
      retro_id: retroId
    }
  }
}
