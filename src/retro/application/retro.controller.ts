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
  async createRetro(@User() user: TokenUser, @Body() body) {
    const runningRetro = await this.prismaService.retrospective.findFirst({
      where: {
        is_running: true,
        team_id: body.teamID,
      },
    });

    if (runningRetro) {
      throw new BadRequestException(
        'One retro for this team is already running.',
      );
    }

    return await this.retroService.createRetro(user.id, body);
  }
}
