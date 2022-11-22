import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards, Header } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GatewayService } from 'src/gateway/gateway.service';
import { RetroService } from './retro.service';
import { v4 as uuid } from 'uuid';
import { RetroColumn } from 'src/gateway/objects/retroRoom.object';
import { User } from 'src/utils/decorators/user.decorator';
import { TokenUser } from 'src/types';

@Controller('retros')
export class RetroController {
  constructor(private retroService: RetroService, private gatewayService: GatewayService) {
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

    const room = await this.gatewayService.addRetroRoom(
      "0251185b-8d7b-4b44-8891-d7d0274e7cb6",
      body.teamId,
      // TODO:
      // change it
      body.columns.map((column: RetroColumn) => {
        column.id = uuid();
        return column;
      }),
    );
    room.setScrum(user.id);

    return {
      retro_id: "0251185b-8d7b-4b44-8891-d7d0274e7cb6"
    }
  }
}
