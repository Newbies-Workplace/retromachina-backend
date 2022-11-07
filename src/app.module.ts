import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { config } from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleModule } from './google/google.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaModule } from './prisma/prisma.module';

config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    GoogleModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
