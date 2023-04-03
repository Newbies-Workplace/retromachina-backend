import { Module } from '@nestjs/common';
import { RetroService } from './domain/retro.service';
import { RetroController } from './application/retro.controller';
import { RetroGateway } from './application/retro.gateway';
import { AuthModule } from '../auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RetroSchedules } from './application/retro.schedules';

@Module({
  imports: [AuthModule, ScheduleModule.forRoot()],
  providers: [RetroService, RetroGateway, RetroSchedules],
  controllers: [RetroController],
})
export class RetroModule {}
