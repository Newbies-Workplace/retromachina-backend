import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { RetroService } from './retro.service';

@Controller('retros')
export class RetroController {
  constructor(private retroService: RetroService) {}
  @Get(':id')
  async getRetroDates(@Param('id') teamId: string) {
    return await this.retroService.getRetroDates(teamId);
  }

  @Get()
  getRetroInfo(@Query('team_id') teamId: string) {
    if (!teamId || teamId.trim().length === 0) throw new NotFoundException();
  }
}
