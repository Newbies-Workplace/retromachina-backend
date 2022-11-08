import { Controller, Get, NotFoundException, Param, Post, UseGuards, Request, ForbiddenException, Body, HttpStatus } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CreateTeamDto } from './dto/createTeam.dto';
import { TeamService } from './team.service';

@Controller('teams')
export class TeamController {
    
    constructor(private teamService: TeamService) {}

    @Get(":id")
    @UseGuards(JwtGuard)
    getTeam(@Param("id") teamId: string){
        if (teamId.trim().length === 0) {
            throw new NotFoundException();
        }
        
        return this.teamService.getTeam(teamId);
    }

    @UseGuards(JwtGuard)
    @Post()
    async createTeam(@Request() request, @Body() createTeamDto: CreateTeamDto){
        if (!request.user.isScrum) {
            throw new ForbiddenException;
        }
        
        const token = request.user;
        const user = token.user;
        this.teamService.createTeam(user, createTeamDto);
    }
}
