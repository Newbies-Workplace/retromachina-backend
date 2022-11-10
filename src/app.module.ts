import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { config } from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { TeamModule } from './team/team.module';
import { TaskModule } from './task/task.module';
import { RetroModule } from './retro/retro.module';

config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    TeamModule,
    TaskModule,
    RetroModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
