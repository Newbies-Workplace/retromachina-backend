import { Controller, Get, Redirect, UseGuards, Response } from '@nestjs/common';
import { config } from 'dotenv';
import { GoogleUser } from 'src/types';
import { User } from 'src/utils/decorators/user.decorator';
import { AuthService } from './auth.service';
import { GoogleGuard } from './guard/google.guard';

config();

@Controller('google')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(GoogleGuard)
  @Get('redirect')
  async googleAuth() {}

  @UseGuards(GoogleGuard)
  @Get('login')
  async googleLogin(@User() user: GoogleUser, @Response() response) {
    const token = await this.authService.googleAuth(user);

    response.status(200);
    return response.json({
      access_token: token,
    });
  }
}
