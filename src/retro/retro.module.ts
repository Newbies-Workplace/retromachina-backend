import { Module } from '@nestjs/common';
import { RetroService } from './domain/retro.service';
import { RetroController } from './application/retro.controller';
import { RetroGateway } from './application/retro.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [RetroService, RetroGateway],
  controllers: [RetroController],
})
export class RetroModule {}
