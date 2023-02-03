import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
