import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  ForbiddenException,
  Body,
  Put,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { TokenUser } from 'src/types';
import { User } from 'src/utils/decorators/user.decorator';
import { CreateTeamDto } from './dto/createTeam.dto';
import { EditTeamDto } from './dto/editTeam.dto';
import { TeamService } from './team.service';

@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Get(':id')
  @UseGuards(JwtGuard)
  async getTeam(@Param('id') teamId: string) {
    if (teamId.trim().length === 0) throw new NotFoundException();

    return await this.teamService.getTeam(teamId);
  }

  @UseGuards(JwtGuard)
  @Post()
  async createTeam(
    @User() user: TokenUser,
    @Body() createTeamDto: CreateTeamDto,
  ) {
    if (!user.isScrum) throw new ForbiddenException();

    await this.teamService.createTeam(user, createTeamDto);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async editTeam(
    @User() user: TokenUser,
    @Body() editTeamDto: EditTeamDto,
    @Param('id') teamId: string,
  ) {
    if (!user.isScrum) throw new ForbiddenException();

    await this.teamService.editTeam(user, teamId, editTeamDto);
  }
}
