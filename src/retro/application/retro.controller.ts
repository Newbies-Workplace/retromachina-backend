import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RetroService } from '../domain/retro.service';
import { v4 as uuid } from 'uuid';
import { RetroColumn } from 'src/retro/application/model/retroRoom.interface';
import { User } from 'src/auth/jwt/jwtuser.decorator';
import { JWTUser } from 'src/auth/jwt/JWTUser';
import { PrismaService } from 'src/prisma/prisma.service';
import { RetroGateway } from './retro.gateway';

@Controller('retros')
export class RetroController {
  constructor(
    private retroService: RetroService,
    private retroGateway: RetroGateway,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @UseGuards(JwtGuard)
  async getRetroDates(@Query('team_id') teamId: string) {
    if (teamId.trim().length === 0)
      throw new BadRequestException('No query param');
    return await this.retroService.getRetroDates(teamId);
  }

  @Get(':retroId')
  @UseGuards(JwtGuard)
  async getRetro(@Param('retroId') retroId: string) {
    if (retroId.trim().length === 0)
      throw new BadRequestException('No query param');
    return await this.retroService.getRetro(retroId);
  }

  @Post()
  @UseGuards(JwtGuard)
  async createRetro(@User() user: JWTUser, @Body() body) {
    // TODO: Jedno retro na jeden team, validacja teamu

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
    room.setScrum(user.id);

    return {
      retro_id: retroId,
    };
  }
}
