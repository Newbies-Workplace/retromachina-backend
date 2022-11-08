import { Controller, Get, Query, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Get("@me")
    @UseGuards(JwtGuard)
    getUser(@Request() request) {
        const token = request.user;
        const user = token.user;

        return this.userService.getUserMe(user);
    }

    @Get("")
    @UseGuards(JwtGuard)
    getUsers(@Request() request, @Query("team_id") teamId: string) {
        if (!teamId || teamId.trim().length === 0) {
            throw new NotFoundException();
        }
        return this.userService.getUsers(teamId);
    }

}
