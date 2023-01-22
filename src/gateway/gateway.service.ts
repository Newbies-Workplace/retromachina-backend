import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenUser } from 'src/types';
import {
  AddActionPointPayload,
  CardAddToCardPayload,
  ChangeActionPointOwnerPayload, ChangeCurrentDiscussCardPayload,
  DeleteActionPointPayload,
  MoveCardToColumnPayload,
  NewCardPayload,
  WriteStatePayload,
} from './interfaces/request.interface';
import { RetroRoom } from './objects/retroRoom.object';
import { Card, RetroColumn } from './interfaces/retroRoom.interface';
import { v4 as uuid } from 'uuid';
import { RoomState } from 'src/utils/validator/roomstate.validator';
import { RoomStateValidator } from 'src/utils/validator/roomstate.validator';

enum ErrorTypes {
  RetrospectiveNotFound = 'RetrospectiveNotFound',
  UserNotFound = 'UserNotFound',
  Unauthorized = 'Unauthorized',
  JwtError = 'JwtError',
  InvalidRoomState = 'InvalidRoomState',
}

interface UserData {
  user: User;
  roomId: string;
}

@Injectable()
export class GatewayService {
  public users = new Map<string, UserData>();
  public retroRooms = new Map<string, RetroRoom>();

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async addRetroRoom(retroId: string, teamId: string, columns: RetroColumn[]) {
    const retroRoom = new RetroRoom(retroId, teamId, columns);
    this.retroRooms.set(retroId, retroRoom);
    return retroRoom;
  }

  // [HANDLERS]

  async handleConnection(client: Socket, retroId: string, user: TokenUser) {
    const room = this.retroRooms.get(retroId);
    if (!room) {
      this.doException(
        client,
        ErrorTypes.RetrospectiveNotFound,
        `Retrospective (${retroId}) not found`,
      );
      return;
    }

    const userQuery = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        TeamUsers: {
          where: {
            team_id: room.teamId
          }
        }
      }
    });

    this.users.set(client.id, {
      user: userQuery,
      roomId: room.id,
    });

    if (!userQuery) {
      this.doException(
        client,
        ErrorTypes.UserNotFound,
        `User (${user.id}) not found`,
      );
      return;
    }

    if (userQuery.user_type == 'SCRUM_MASTER') {
      // Sprawdzanie userId scrum mastera teamu ? rozłączenie
      if (room.scrumData.userId === user.id) {
        room.setScrum(user.id);
        room.addUser(client.id, user.id);
      } else {
        this.doException(
          client,
          ErrorTypes.Unauthorized,
          `User (${user.id}) is not authorized to be a SCRUM_MASTER of this team`,
        );
        return;
      }
    } else {
      if (userQuery.TeamUsers.length === 0) {
        this.doException(
          client,
          ErrorTypes.Unauthorized,
          `User (${user.id}) is not in team (${room.teamId})`,
        );
        return;
      }

      room.addUser(client.id, user.id);
    }

    client.join(retroId);
    const roomData = room.getFrontData();

    client.emit('event_on_join', {
      roomData,
    });

    client.broadcast.to(retroId).emit('event_room_sync', {
      roomData,
    });
  }

  handleReady(server: Server, client: Socket, readyState: boolean) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    if (roomUser.isReady !== readyState) {
      roomUser.isReady = readyState;
      readyState ? room.usersReady++ : room.usersReady--;
      this.emitRoomDataTo(roomId, server, room);
    }
  }

  handleNewCard(server: Server, client: Socket, newCard: NewCardPayload) {
    if (newCard.text.trim().length === 0) return;
    if (newCard.text.length > 1000) newCard.text = newCard.text.slice(0, 1000);

    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    const card = newCard as unknown as Card;
    card.id = uuid();
    card.authorId = roomUser.userId;
    card.parentCardId = null;

    const column = room.retroColumns.find(
      (column) => column.id === card.columnId,
    );
    if (!column) {
      return;
    }
    room.cards.unshift(card);

    this.emitRoomDataTo(roomId, server, room);
  }

  handleDeleteCard(server: Server, client: Socket, cardId: string) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    const cardIndex = room.cards.findIndex(
      (card) => card.id === cardId && card.authorId === roomUser.userId,
    );
    if (cardIndex !== -1) {
      room.cards = room.cards.filter(
        (card) => !(card.id === cardId && card.authorId === roomUser.userId),
      );
      this.emitRoomDataTo(roomId, server, room);
    }
  }

  handleWriteState(server: Server, client: Socket, data: WriteStatePayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    const column = room.retroColumns.find((column) => {
      return column.id === data.columnId;
    });

    if (column) {
      if (data.writeState) {
        roomUser.writingInColumns.push(data.columnId);
        column.usersWriting++;
      } else {
        roomUser.writingInColumns = roomUser.writingInColumns.filter(
          (columnId) => {
            return columnId !== data.columnId;
          },
        );
        column.usersWriting--;
      }

      roomUser.isWriting = roomUser.writingInColumns.length > 0;
      this.emitRoomDataTo(roomId, server, room);
    }
  }

  handleRoomState(server: Server, client: Socket, roomState: RoomState) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    const isValid = RoomStateValidator.validate(roomState);
    if (!isValid) {
      this.doException(
        client,
        ErrorTypes.InvalidRoomState,
        `Invalid room state value (${roomState})`,
      );
      return;
    }

    room.changeState(roomState);

    this.emitRoomDataTo(roomId, server, room);
  }

  handleChangeTimer(server: Server, client: Socket, timestamp: number) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.timerEnds = timestamp;
    this.emitRoomDataTo(roomId, server, room);
  }

  handleVoteOnCard(server: Server, client: Socket, parentCardId: string) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    const userVotes = room.votes.filter(
      (vote) => vote.voterId === roomUser.userId,
    ).length;
    if (userVotes < room.maxVotes) {
      const card = room.cards.find((card) => card.id === parentCardId);
      if (!card) {
        return;
      }

      room.addVote(roomUser.userId, parentCardId);
      this.emitRoomDataTo(roomId, server, room);
    }
  }

  handleRemoveVoteOnCard(server: Server, client: Socket, parentCardId: string) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    room.removeVote(roomUser.userId, parentCardId);
    this.emitRoomDataTo(roomId, server, room);
  }

  handleChangeVoteAmount(server: Server, client: Socket, amount: number) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);
    if (room.scrumData.userId !== roomUser.userId) {
      return;
    }

    room.setVoteAmount(amount);
    this.emitRoomDataTo(roomId, server, room);
  }

  handleCardAddToCard(
    server: Server,
    client: Socket,
    data: CardAddToCardPayload,
  ) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.addCardToCard(data.parentCardId, data.cardId);
    this.emitRoomDataTo(roomId, server, room);
  }

  handleMoveCardToColumn(
    server: Server,
    client: Socket,
    data: MoveCardToColumnPayload,
  ) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.moveCardToColumn(data.cardId, data.columnId);
    this.emitRoomDataTo(roomId, server, room);
  }

  async handleCloseRoom(server: Server, client: Socket) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    if (roomUser.userId === room.scrumData.userId) {
      const board = await this.prismaService.board.findUnique({
        where: {
          team_id: room.teamId
        }
      })

      await this.prismaService.task.createMany({
        data: room.actionPoints.map((actionPoint) => {
          return {
            description: actionPoint.text,
            owner_id: actionPoint.ownerId,
            retro_id: room.id,
            team_id: room.teamId,
            column_id: board.default_column_id,
          };
        }),
      });

      await this.prismaService.retrospective.update({
        where: { id: room.id },
        data: { is_running: false },
      });

      this.retroRooms.delete(roomId);
    }

    server.to(roomId).emit('event_close_room');
  }

  handleAddActionPoint(
    server: Server,
    client: Socket,
    data: AddActionPointPayload,
  ) {
    if (data.text.trim().length === 0) {
      return;
    }

    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.addActionPoint(data.text, data.ownerId);
    this.emitRoomDataTo(roomId, server, room);
  }

  handleDeleteActionPoint(
    server: Server,
    client: Socket,
    data: DeleteActionPointPayload,
  ) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.deleteActionPoint(data.actionPointId);
    this.emitRoomDataTo(roomId, server, room);
  }

  handleChangeDiscussionCard(
    server: Server,
    client: Socket,
    data: ChangeCurrentDiscussCardPayload,
  ) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.changeDiscussionCard(data.cardId);
    this.emitRoomDataTo(roomId, server, room);
  }

  handleChangeActionPointOwner(
    server: Server,
    client: Socket,
    data: ChangeActionPointOwnerPayload,
  ) {
    //TODO: Change action point handler
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.changeActionPointOwner(data.actionPointId, data.ownerId);
    this.emitRoomDataTo(roomId, server, room);
  }

  // [UTILS]

  getUserFromJWT(client: Socket) {
    try {
      const result = this.jwtService.verify(
        client.handshake.headers.authorization,
        { secret: process.env.JWT_SECRET },
      );
      return result.user;
    } catch (error) {
      if (error.name == 'JsonWebTokenError') {
        this.doException(client, ErrorTypes.JwtError, 'JWT must be provided!');
      }
    }
  }

  doException(client: Socket, type: ErrorTypes, message: string) {
    this.users.delete(client.id);

    client.emit('error', {
      type,
      message,
    });
    client.disconnect();
  }

  emitRoomDataTo(roomId: string, server: Server, room: RetroRoom) {
    server.to(roomId).emit('event_room_sync', {
      roomData: room.getFrontData(),
    });
  }

  handleUserDisconnect(server: Server, client: Socket) {
    try {
      const user = this.users.get(client.id);
      const roomId = user.roomId;
      const room = this.retroRooms.get(user.roomId);

      this.users.delete(client.id);
      room.removeUser(client.id, user.user.id);

      server.to(roomId).emit('event_room_sync', {
        roomData: room.getFrontData(),
      });
    } catch (e) {
      console.log(e);
    }
  }
}
