import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { RetroService } from './retro.service';

@Controller('retros')
export class RetroController {
  constructor(private retroService: RetroService) {}
  @Get()
  async getRetroDates(@Query('team_id') teamId: string) {
    if (teamId.trim().length === 0)
      throw new BadRequestException('No query param');
    return await this.retroService.getRetroDates(teamId);
  }
}
