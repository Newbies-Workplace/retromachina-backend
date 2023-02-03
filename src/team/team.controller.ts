import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { JWTUser } from 'src/auth/jwt/JWTUser';
import { User } from 'src/auth/jwt/jwtuser.decorator';
import { CreateTeamRequest } from './dto/createTeam.request';
import { EditTeamRequest } from './dto/editTeam.request';
import { TeamService } from './team.service';
import { TeamResponse } from './dto/team.response';
import { toTeamResponse } from './team.converter';

@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Get(':id')
  @UseGuards(JwtGuard)
  async getTeam(@Param('id') teamId: string): Promise<TeamResponse> {
    if (teamId.trim().length === 0) {
      throw new BadRequestException('No query param')
    }

    const team = await this.teamService.getTeam(teamId)

    return toTeamResponse(team)
  }

  @UseGuards(JwtGuard)
  @Post()
  async createTeam(
    @User() user: JWTUser,
    @Body() createTeamDto: CreateTeamRequest,
  ): Promise<TeamResponse> {
    if (!user.isScrum) {
      throw new ForbiddenException()
    }

    const team = await this.teamService.createTeam(user, createTeamDto)

    return toTeamResponse(team)
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  @HttpCode(204)
  async editTeam(
    @User() user: JWTUser,
    @Body() editTeamDto: EditTeamRequest,
    @Param('id') teamId: string,
  ): Promise<TeamResponse> {
    if (!user.isScrum) {
      throw new ForbiddenException()
    }

    const team = await this.teamService.editTeam(user, teamId, editTeamDto)

    return toTeamResponse(team)
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteTeam(@User() user: JWTUser, @Param('id') teamId: string) {
    if (!user.isScrum) throw new ForbiddenException();

    await this.teamService.deleteTeam(teamId);
  }
}
