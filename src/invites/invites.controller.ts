import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { JWTUser } from 'src/auth/jwt/JWTUser';
import { User } from 'src/auth/jwt/jwtuser.decorator';
import { InvitesService } from './invites.service';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getUsers(@User() user: JWTUser, @Query('team_id') teamId: string) {
    if (!teamId || teamId.trim().length === 0) throw new NotFoundException();

    if (!user.isScrum) throw new ForbiddenException();

    return await this.invitesService.getInvitesByTeamId(teamId);
  }
}
