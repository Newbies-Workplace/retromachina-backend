import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [UserModule],
  controllers: [TeamController],
  providers: [TeamService, JwtStrategy],
})
export class TeamModule {}
