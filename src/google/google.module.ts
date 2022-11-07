import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Module({
  providers: [GoogleService, GoogleStrategy, JwtService],
  controllers: [GoogleController]
})
export class GoogleModule {}
