import { Controller, Get, Redirect, UseGuards, Request, Response } from "@nestjs/common";
import { config } from "dotenv";
import { GoogleUser } from "src/types";
import { AuthService } from "./auth.service";
import { GoogleGuard } from "./guard/google.guard";


config();

@Controller('google')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get("redirect")
    @UseGuards(GoogleGuard)
    @Redirect(process.env.HOME_PATH)
    async googleAuth(@Request() request, @Response() response) {
        const user: GoogleUser = request.user;
        const token = await this.authService.googleAuth(user);
        
        response.cookie('jwtToken', token);
    }
}
