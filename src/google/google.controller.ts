import { Controller, Get, Redirect, UseGuards, Request, Response } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { GoogleGuard } from "./guard/google.guard";


@Controller('google')
export class GoogleController {
    constructor(private jwtService: JwtService, private prismaService: PrismaService ) {}

    @Get("redirect")
    @UseGuards(GoogleGuard)
    @Redirect("/")
    async googleAuth(@Request() request, @Response() response) {
        const user = request.user;
        
        let queryUser = await this.prismaService.user.findFirst({
            where: {
                google_id: user.id
            }
        });

        if (!queryUser) {
            queryUser = await this.prismaService.user.create({
                data: {
                    nick: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    avatar_link: user.picture,
                    google_id: user.id
                }
            });
        }

        response.cookie('jwtToken', this.jwtService.sign(queryUser, {secret: process.env.JWT_SECRET}));
    }
}
