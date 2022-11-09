import {
  Controller,
  Get,
  Redirect,
  UseGuards,
  Response,
} from '@nestjs/common';
import { config } from 'dotenv';
import { GoogleUser } from 'src/types';
import { User } from 'src/utils/decorators/user.decorator';
import { AuthService } from './auth.service';
import { GoogleGuard } from './guard/google.guard';

config();

@Controller('google')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('redirect')
  @UseGuards(GoogleGuard)
  @Redirect(process.env.HOME_PATH)
  async googleAuth(@User() user: GoogleUser, @Response() response) {
    const token = this.authService.googleAuth(user);

    response.cookie('jwtToken', token);
  }
}
