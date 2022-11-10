import { Module } from '@nestjs/common';
import { RetroService } from './retro.service';
import { RetroController } from './retro.controller';

@Module({
  providers: [RetroService],
  controllers: [RetroController]
})
export class RetroModule {}
