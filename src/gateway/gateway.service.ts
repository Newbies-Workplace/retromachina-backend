import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { Token, TokenUser } from 'src/types';
import { RetroColumn, RetroRoom} from './objects/retroRoom.object';


enum ErrorTypes {
    RetrospectiveNotFound = "RetrospectiveNotFound",
    UserNotFound = "UserNotFound",
    UnauthorizedScrum = "UnauthorizedScrum",
    JwtError = "JwtError",
}

interface UserData {
    user: User,
    roomId: string
}

@Injectable()
export class GatewayService {
    public users = new Map<string, UserData>();
    public retroRooms = new Map<string, RetroRoom>();
    constructor(private prismaService: PrismaService, private jwtService: JwtService){}

    async addRetroRoom(retroId: string, teamId: string, columns: RetroColumn[]) {
        const retroRoom = new RetroRoom(retroId, teamId, columns);
        this.retroRooms.set(retroId, retroRoom);
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
        this.users.delete(client.id);

        client.emit("error", {
            type,
            message
        });
        client.disconnect();
    }

    async handleConnection(client: Socket, retroId: string, user: TokenUser ) {
        const room = this.retroRooms.get(retroId);
        if (!room) {
            this.doException(client, ErrorTypes.RetrospectiveNotFound, `Retrospective (${retroId}) not found`);
            return;
        }

        const userQuery = await this.prismaService.user.findUnique({
            where: {
                id: user.id
            },
        });

        this.users.set(client.id, {
            user: userQuery,
            roomId: room.id
        });

        if (!userQuery) {
            this.doException(client, ErrorTypes.UserNotFound, `User (${user.id}) not found`);
            return;
        }

        if (userQuery.user_type == "SCRUM_MASTER") {
        // Sprawdzanie userId scrum mastera teamu ? rozłączenie
            console.log(room.scrumData.userId, user.id);
            if (room.scrumData.userId === user.id) {
                room.setScrum(user.id);
                room.addUser(client.id, user.id);
            } else {
                this.doException(client, ErrorTypes.UnauthorizedScrum, `User (${user.id}) is not authorized to be a SCRUM_MASTER of this team`);
                return;
            }
        } else {
            //TODO:
            // Czy użytkownik jest w teamie
            room.addUser(client.id, user.id);
        }
        
        client.emit("event_on_join", {
            roomData: room.getFrontData()
        });
    }

    handleReady(client: Socket, readyState: boolean) {
        const roomId = this.users.get(client.id).roomId;
        const room = this.retroRooms.get(roomId);
        const roomUser = room.users.get(client.id);
        roomUser.isReady = readyState;
    }
}

