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
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RetroService } from './retro.service';
import { User } from 'src/utils/decorators/user.decorator';
import { TokenUser } from 'src/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('retros')
export class RetroController {
  constructor(
    private retroService: RetroService,
    private prismaService: PrismaService,
  ) {
    //this.gatewayService.addRetroRoom("0251185b-8d7b-4b44-8891-d7d0274e7cb6", "uhuhu", Array<RetroColumn>());
  }

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
