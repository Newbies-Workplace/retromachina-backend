import { Controller, Get, Query, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { TokenUser } from 'src/types';
import { User } from 'src/utils/decorators/user.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Get("@me")
    @UseGuards(JwtGuard)
    getUser(@User() user: TokenUser) {
        return this.userService.getUserMe(user);
    }

    @Get("")
    @UseGuards(JwtGuard)
    getUsers(@Query("team_id") teamId: string) {
        if (!teamId || teamId.trim().length === 0) throw new NotFoundException();
        
        return this.userService.getUsers(teamId);
    }

}
