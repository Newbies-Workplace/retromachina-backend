import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleUser } from 'src/types';

config();
@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private prismaService: PrismaService ) {}

    async googleAuth(user: GoogleUser) {
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

        return this.jwtService.sign({
            user: {
                nick: queryUser.nick,
                email: queryUser.email,
                google_id: user.id
            }
        },
        {
            secret: process.env.JWT_SECRET
        });
    }
}
