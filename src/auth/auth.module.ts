import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Module({
  providers: [AuthService, GoogleStrategy, JwtService],
  controllers: [AuthController]
})
export class AuthModule {}
