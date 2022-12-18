import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { TokenUser } from 'src/types';
import { User } from 'src/utils/decorators/user.decorator';
import { InvitesService } from './invites.service';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getUsers(@User() user: TokenUser, @Query('team_id') teamId: string) {
    if (!teamId || teamId.trim().length === 0) throw new NotFoundException();

    if (!user.isScrum) throw new ForbiddenException();

    return await this.invitesService.getInvitesByTeamId(teamId);
  }
}
