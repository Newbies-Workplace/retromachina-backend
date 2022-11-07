import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { config } from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { PrismaModule } from './prisma/prisma.module';

config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    AuthModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
