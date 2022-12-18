import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GatewayService } from './gateway.service';
import {
  AddActionPointPayload,
  CardAddToCardPayload,
  ChangeActionPointOwnerPayload,
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
} from './interfaces/request.interface';

@WebSocketGateway(3001, { cors: true })
export class RetroGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private gatewayService: GatewayService) {}

  @SubscribeMessage('connection')
  async handleConnection(client: Socket) {
    const retroId = client.handshake.query.retro_id as string;
    const user = this.gatewayService.getUserFromJWT(client);
    await this.gatewayService.handleConnection(client, retroId, user);
  }

  @SubscribeMessage('command_ready')
  async handleReady(client: Socket, payload: ReadyPayload) {
    this.gatewayService.handleReady(this.server, client, payload.readyState);
  }

  @SubscribeMessage('command_new_card')
  async handleNewCard(client: Socket, payload: NewCardPayload) {
    this.gatewayService.handleNewCard(this.server, client, payload);
  }

  @SubscribeMessage('command_delete_card')
  handleDeleteCard(client: Socket, payload: DeleteCardPayload) {
    this.gatewayService.handleDeleteCard(this.server, client, payload.cardId);
  }

  @SubscribeMessage('command_write_state')
  handleWriteState(client: Socket, payload: WriteStatePayload) {
    this.gatewayService.handleWriteState(this.server, client, payload);
  }

  @SubscribeMessage('command_room_state')
  handleRoomState(client: Socket, payload: RoomStatePayload) {
    this.gatewayService.handleRoomState(this.server, client, payload.roomState);
  }

  @SubscribeMessage('command_change_timer')
  handleChangeTimer(client: Socket, payload: ChangeTimerPayload) {
    this.gatewayService.handleChangeTimer(
      this.server,
      client,
      payload.timestamp,
    );
  }

  @SubscribeMessage('command_vote_on_card')
  handleVoteOnCard(client: Socket, payload: VoteOnCardPayload) {
    this.gatewayService.handleVoteOnCard(
      this.server,
      client,
      payload.parentCardId,
    );
  }

  @SubscribeMessage('command_remove_vote_on_card')
  handleRemoveVoteOnCard(client: Socket, payload: RemoveVoteOnCardPayload) {
    this.gatewayService.handleRemoveVoteOnCard(
      this.server,
      client,
      payload.parentCardId,
    );
  }

  @SubscribeMessage('command_change_vote_amount')
  handleChangeVoteAmount(client: Socket, payload: ChangeVoteAmountPayload) {
    this.gatewayService.handleChangeVoteAmount(
      this.server,
      client,
      payload.votesAmount,
    );
  }

  @SubscribeMessage('command_card_add_to_card')
  handleCardAddToCard(client: Socket, payload: CardAddToCardPayload) {
    this.gatewayService.handleCardAddToCard(this.server, client, payload);
  }

  @SubscribeMessage('command_move_card_to_column')
  handleMoveCardToColumn(client: Socket, payload: MoveCardToColumnPayload) {
    this.gatewayService.handleMoveCardToColumn(this.server, client, payload);
  }

  @SubscribeMessage('command_close_room')
  async handleCloseRoom(client: Socket) {
    await this.gatewayService.handleCloseRoom(this.server, client);
  }

  @SubscribeMessage('command_add_action_point')
  handleAddActionPoint(client: Socket, payload: AddActionPointPayload) {
    this.gatewayService.handleAddActionPoint(this.server, client, payload);
  }

  @SubscribeMessage('command_delete_action_point')
  handleDeleteActionPoint(client: Socket, payload: DeleteActionPointPayload) {
    this.gatewayService.handleDeleteActionPoint(this.server, client, payload);
  }

  @SubscribeMessage('command_change_action_point_owner')
  handleChangeActionPointOwner(
    client: Socket,
    payload: ChangeActionPointOwnerPayload,
  ) {
    this.gatewayService.handleChangeActionPointOwner(
      this.server,
      client,
      payload,
    );
  }

  @SubscribeMessage('command_next_discussion_card')
  handleNextDiscussionCard(client: Socket) {
    this.gatewayService.handleNextDiscussionCard(this.server, client);
  }

  @SubscribeMessage('command_previous_discussion_card')
  handlePreviousDiscussionCard(client: Socket) {
    this.gatewayService.handlePreviousDiscussionCard(this.server, client);
  }

  handleDisconnect(client: Socket) {
    this.gatewayService.handleUserDisconnect(this.server, client);
  }
}
