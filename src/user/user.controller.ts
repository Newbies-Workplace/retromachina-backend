import {
  Controller,
  Get,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { JWTUser } from 'src/auth/jwt/JWTUser';
import { User } from 'src/auth/jwt/jwtuser.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('@me')
  @UseGuards(JwtGuard)
  getUser(@User() user: JWTUser) {
    return this.userService.getUserMe(user);
  }

  @Get('')
  @UseGuards(JwtGuard)
  getUsers(@Query('team_id') teamId: string) {
    if (!teamId || teamId.trim().length === 0) throw new NotFoundException();

    return this.userService.getUsers(teamId);
  }
}
