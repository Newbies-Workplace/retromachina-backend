import { Controller, Get, Param } from '@nestjs/common';
import { RetroService } from './retro.service';

@Controller('retros')
export class RetroController {
  constructor(private retroService: RetroService) {}
  @Get(':id')
  async getRetroDates(@Param('id') teamId: string) {
    return await this.retroService.getRetroDates(teamId);
  }
}
