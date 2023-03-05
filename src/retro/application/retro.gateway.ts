import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  AddActionPointPayload,
  CardAddToCardPayload,
  ChangeActionPointOwnerPayload,
  ChangeCurrentDiscussCardPayload,
  ChangeTimerPayload,
  ChangeVoteAmountPayload,
  DeleteActionPointPayload,
  DeleteCardPayload,
  MoveCardToColumnPayload,
  NewCardPayload,
  ReadyPayload,
  RemoveVoteOnCardPayload,
  RoomStatePayload,
  VoteOnCardPayload,
  WriteStatePayload,
} from './model/request.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RetroRoom } from '../domain/model/retroRoom.object';
import { Card, RetroColumn } from './model/retroRoom.interface';
import { v4 as uuid } from 'uuid';
import { RoomStateValidator } from './roomstate.validator';
import { ErrorTypes } from './model/ErrorTypes';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
@WebSocketGateway(3001, { cors: true, namespace: 'retro' })
export class RetroGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users = new Map<string, {roomId: string; user: User}>();
  private retroRooms = new Map<string, RetroRoom>();

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async addRetroRoom(
    retroId: string,
    teamId: string,
    scrumMasterId: string,
    columns: RetroColumn[],
  ) {
    const retroRoom = new RetroRoom(retroId, teamId, scrumMasterId, columns);
    this.retroRooms.set(retroId, retroRoom);
    return retroRoom;
  }

  async handleConnection(client: Socket) {
    const retroId = client.handshake.query.retro_id as string;
    const user = this.getUserFromJWT(client);
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

    if (!userQuery) {
      this.doException(
        client,
        ErrorTypes.UserNotFound,
        `User (${user.id}) not found`,
      );
      return;
    }

    if (
      userQuery.TeamUsers.length === 0 ||
      (userQuery.user_type === 'SCRUM_MASTER' && room.scrumMasterId !== user.id)
    ) {
      this.doException(
        client,
        ErrorTypes.Unauthorized,
        `User (${user.id}) is not in team (${room.teamId})`,
      );
      return;
    }

    room.addUser(client.id, user.id);

    this.users.set(client.id, {
      user: userQuery,
      roomId: room.id,
    });

    client.join(retroId);

    const roomData = room.getFrontData();
    this.server.to(room.id).emit('event_room_sync', {roomData});
  }

  @SubscribeMessage('command_ready')
  async handleReady(client: Socket, {readyState}: ReadyPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    if (roomUser.isReady !== readyState) {
      roomUser.isReady = readyState;

      this.emitRoomSync(roomId, room);
    }
  }

  @SubscribeMessage('command_new_card')
  async handleNewCard(client: Socket, payload: NewCardPayload) {
    if (payload.text.trim().length === 0) return;
    if (payload.text.length > 1000) payload.text = payload.text.slice(0, 1000);

    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    const card = payload as unknown as Card;
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

    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_delete_card')
  handleDeleteCard(client: Socket, {cardId}: DeleteCardPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    const cardIndex = room.cards.findIndex(
      (card) => card.id === cardId && card.authorId === roomUser.userId,
    );

    if (cardIndex === -1) {
      return
    }

    room.cards = room.cards.filter(
      (card) => !(card.id === cardId && card.authorId === roomUser.userId),
    );
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_write_state')
  handleWriteState(client: Socket, payload: WriteStatePayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    const column = room.retroColumns.find((column) => {
      return column.id === payload.columnId;
    });

    if (!column) {
      return
    }

    if (payload.writeState) {
      roomUser.writingInColumns.add(column.id)
    } else {
      roomUser.writingInColumns.delete(column.id)
    }

    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_room_state')
  handleRoomState(client: Socket, payload: RoomStatePayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    const isValid = RoomStateValidator.validate(payload.roomState);
    if (!isValid) {
      this.doException(
        client,
        ErrorTypes.InvalidRoomState,
        `Invalid room state value (${payload.roomState})`,
      );
      return;
    }

    room.changeState(payload.roomState);

    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_change_timer')
  handleChangeTimer(client: Socket, payload: ChangeTimerPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.timerEnds = payload.timestamp;
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_vote_on_card')
  handleVoteOnCard(client: Socket, payload: VoteOnCardPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    const userVotes = room.votes.filter(
      (vote) => vote.voterId === roomUser.userId,
    ).length;

    if (userVotes >= room.maxVotes) {
      return;
    }

    const card = room.cards.find((card) => card.id === payload.parentCardId);
    if (!card) {
      return;
    }

    room.addVote(roomUser.userId, payload.parentCardId);
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_remove_vote_on_card')
  handleRemoveVoteOnCard(client: Socket, payload: RemoveVoteOnCardPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    room.removeVote(roomUser.userId, payload.parentCardId);
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_change_vote_amount')
  handleChangeVoteAmount(client: Socket, payload: ChangeVoteAmountPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);
    if (room.scrumMasterId !== roomUser.userId) {
      return;
    }

    room.setVoteAmount(payload.votesAmount);
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_card_add_to_card')
  handleCardAddToCard(client: Socket, payload: CardAddToCardPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.addCardToCard(payload.parentCardId, payload.cardId);
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_move_card_to_column')
  handleMoveCardToColumn(client: Socket, payload: MoveCardToColumnPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.moveCardToColumn(payload.cardId, payload.columnId);
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_close_room')
  async handleCloseRoom(client: Socket) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);
    const roomUser = room.users.get(client.id);

    if (roomUser.userId !== room.scrumMasterId) {
      return
    }

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
    this.server.to(roomId).emit('event_close_room');
  }

  @SubscribeMessage('command_add_action_point')
  handleAddActionPoint(client: Socket, payload: AddActionPointPayload) {
    if (payload.text.trim().length === 0) {
      return;
    }

    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.addActionPoint(payload.text, payload.ownerId);
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_delete_action_point')
  handleDeleteActionPoint(client: Socket, payload: DeleteActionPointPayload) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.deleteActionPoint(payload.actionPointId);
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_change_action_point_owner')
  handleChangeActionPointOwner(
    client: Socket,
    payload: ChangeActionPointOwnerPayload,
  ) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.changeActionPointOwner(payload.actionPointId, payload.ownerId);
    this.emitRoomSync(roomId, room);
  }

  @SubscribeMessage('command_change_discussion_card')
  handleChangeDiscussionCard(
    client: Socket,
    payload: ChangeCurrentDiscussCardPayload,
  ) {
    const roomId = this.users.get(client.id).roomId;
    const room = this.retroRooms.get(roomId);

    room.changeDiscussionCard(payload.cardId);
    this.emitRoomSync(roomId, room);
  }

  async handleDisconnect(client: Socket) {
    const user = this.users.get(client.id);
    const roomId = user.roomId;
    const room = this.retroRooms.get(user.roomId);

    this.users.delete(client.id);

    if (!room) {
      return
    }
    room.removeUser(client.id, user.user.id);

    this.server.to(roomId).emit('event_room_sync', {
      roomData: room.getFrontData(),
    });
  }

  private emitRoomSync(roomId: string, room: RetroRoom) {
    this.server.to(roomId).emit('event_room_sync', {
      roomData: room.getFrontData(),
    });
  }

  private doException(client: Socket, type: ErrorTypes, message: string) {
    this.users.delete(client.id);

    client.emit('error', {
      type,
      message,
    });
    client.disconnect();
  }

  private getUserFromJWT(client: Socket) {
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
}
