import { Module } from '@nestjs/common';
import { RetroService } from './retro.service';
import { RetroController } from './retro.controller';
import { GatewayModule } from 'src/gateway/gateway.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [GatewayModule],
  providers: [RetroService, JwtService],
  controllers: [RetroController],
})
export class RetroModule {}
