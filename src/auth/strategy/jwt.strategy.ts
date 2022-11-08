import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { Token } from 'src/types';
import { PrismaService } from 'src/prisma/prisma.service';

config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // TO BE CHANGED
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: Token) {
    const user = await this.prismaService.user.findFirst({
        where: {
            id: payload.user.id
        }
    });

    return {
      isScrum: (user && user.user_type !== "USER") ? (true) : (false),
      user
    };
  }
}
