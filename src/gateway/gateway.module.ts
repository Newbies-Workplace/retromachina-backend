import { Module } from '@nestjs/common';
import { RetroGateway } from './retro.gateway';
import { GatewayService } from './gateway.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    providers: [RetroGateway, GatewayService, JwtService, PrismaService],
    exports: [GatewayService]
})
export class GatewayModule {}
