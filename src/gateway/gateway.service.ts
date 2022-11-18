import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { Token, TokenUser } from 'src/types';
import { RetroColumn, RetroRoom } from './objects/retroRoom.object';


enum ErrorTypes {
    RetrospectiveNotFound = "RetrospectiveNotFound",
    UserNotFound = "UserNotFound",
    UnauthorizedScrum = "UnauthorizedScrum",
}

@Injectable()
export class GatewayService {
    public retroRooms = new Map<string, RetroRoom>();
    constructor(private prismaService: PrismaService, private jwtService: JwtService){}

    async addRetroRoom(retroId: string, teamId: string, columns: RetroColumn[]) {
        const retroRoom = new RetroRoom(retroId, teamId, columns);
        this.retroRooms[retroId] = retroRoom;
        return retroRoom;
    }

    checkUserCreds(retroId: string, user: Token) {
        //TODO:
        //coś tam
    }

    getUserFromJWT(JWT: string) {
        let result = this.jwtService.verify(
            JWT,
            { secret: process.env.JWT_SECRET }
        )
        return result.user;
    }

    doException(client: Socket, type: ErrorTypes, message: string) {
        client.emit("error", {
            type,
            message
        });
        client.disconnect();
    }

    async handleJoin(client: Socket, retroId: string, user: TokenUser ) {
        const room = this.retroRooms[retroId];
        if (!room) {
            // TODO:
            // co sie stanie jak złe id retro
            this.doException(client, ErrorTypes.RetrospectiveNotFound, `Retrospective (${retroId}) not found`);
            return;
        }

        const userQuery = await this.prismaService.user.findUnique({
            where: {
                id: user.id
            },
        });

        if (!userQuery) {
            this.doException(client, ErrorTypes.UserNotFound, `User (${user.id}) not found`);
            return;
        }

        if (userQuery.user_type == "SCRUM_MASTER") {
        // Sprawdzanie userId scrum mastera teamu ? rozłączenie
            if (room.scrumData.userId === user.id) {
                room.setScrum(client.id, user.id);
            } else {
                this.doException(client, ErrorTypes.UnauthorizedScrum, "User is not authorized to be a SCRUM_MASTER of this team");
                return;
            }
        } else {
            //TODO:
            // Czy użytkownik jest w teamie
            room.addUser(client.id, user.id);
        }
        
        client.emit("event_on_join", {
            roomData: room.getFronData()
        });
    }
}

