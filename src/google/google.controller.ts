import { Controller, Get, Redirect, UseGuards, Request, Response } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { GoogleService } from "./google.service";
import { GoogleGuard } from "./guard/google.guard";


@Controller('google')
export class GoogleController {
    constructor(private jwtService: JwtService) {}

    @Get("redirect")
    @UseGuards(GoogleGuard)
    @Redirect("/")
    googleAuth(@Request() request, @Response() response) {
        response.cookie('jwtToken', this.jwtService.sign(request.user, {secret: process.env.JWT_SECRET}));
    }
}
