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
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { TokenUser } from 'src/types';
import { User } from 'src/utils/decorators/user.decorator';
import { CreateTeamDto } from './dto/createTeam.dto';
import { EditTeamDto } from './dto/editTeam.dto';
import { TeamService } from './team.service';
import { EditBoardDto } from './dto/editBoard.dto';

@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Get(':id')
  @UseGuards(JwtGuard)
  async getTeam(@Param('id') teamId: string) {
    if (teamId.trim().length === 0)
      throw new BadRequestException('No query param');

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
  @HttpCode(204)
  async editTeam(
    @User() user: TokenUser,
    @Body() editTeamDto: EditTeamDto,
    @Param('id') teamId: string,
  ) {
    if (!user.isScrum) throw new ForbiddenException();

    await this.teamService.editTeam(user, teamId, editTeamDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteTeam(@User() user: TokenUser, @Param('id') teamId: string) {
    if (!user.isScrum) throw new ForbiddenException();

    await this.teamService.deleteTeam(teamId);
  }

  @UseGuards(JwtGuard)
  @Put(':id/board')
  async editBoard(
    @User() user: TokenUser,
    @Body() boardDto: EditBoardDto,
    @Param('id') teamId: string,
  ) {
    if (!user.isScrum) throw new ForbiddenException();

    await this.teamService.editBoard(teamId, boardDto);
  }

  @UseGuards(JwtGuard)
  @Get(':id/board')
  async getBoard(
    @User() user: TokenUser,
    @Param('id') teamId: string,
  ): Promise<EditBoardDto> {
    return await this.teamService.getBoard(user, teamId);
  }
}
