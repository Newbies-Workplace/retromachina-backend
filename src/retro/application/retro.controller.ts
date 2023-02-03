import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RetroService } from '../domain/retro.service';
import { User } from 'src/auth/jwt/jwtuser.decorator';
import { JWTUser } from 'src/auth/jwt/JWTUser';
import { PrismaService } from 'src/prisma/prisma.service';
import { RetroCreateRequest } from './model/request.interface';

@Controller('retros')
export class RetroController {
  constructor(
    private retroService: RetroService,
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
  async createRetro(@User() user: JWTUser, @Body() body: RetroCreateRequest) {
    const runningRetro = await this.prismaService.retrospective.findFirst({
      where: {
        is_running: true,
        team_id: body.teamId,
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
