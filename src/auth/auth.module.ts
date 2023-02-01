import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google/google.strategy';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Module({
  providers: [AuthService, GoogleStrategy, JwtService],
  controllers: [AuthController],
  exports: [JwtService]
})
export class AuthModule {}
