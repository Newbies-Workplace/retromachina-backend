import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { UserController } from './application/user.controller';
import { AuthAbilityFactory } from '../auth/auth.ability';

@Module({
  controllers: [UserController],
  providers: [JwtStrategy, AuthAbilityFactory],
})
export class UserModule {}
