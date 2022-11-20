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
    JwtError = "JwtError",
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

    // Czy potrzebne???
    checkUserCreds(client: Socket) {
        const user = this.getUserFromJWT(client);
    }

    getUserFromJWT(client: Socket) {
        try {
            let result = this.jwtService.verify(
                client.handshake.headers.authorization,
                { secret: process.env.JWT_SECRET }
            );
            return result.user;
            
        } catch (error) {
            if (error.name == "JsonWebTokenError") {
                this.doException(client, ErrorTypes.JwtError, "JWT must be provided!");
            }
        }
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
                room.setScrum(client.id, user);
            } else {
                this.doException(client, ErrorTypes.UnauthorizedScrum, `User (${user.id}) is not authorized to be a SCRUM_MASTER of this team`);
                return;
            }
        } else {
            //TODO:
            // Czy użytkownik jest w teamie
            room.addUser(client.id, user);
        }
        
        client.emit("event_on_join", {
            roomData: room.getFronData()
        });
    }
}

