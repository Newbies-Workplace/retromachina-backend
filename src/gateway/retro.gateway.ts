import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GatewayService } from './gateway.service';
import { ChangeTimerPayload, DeleteCardPayload, NewCardPayload, ReadyPayload, RoomStatePayload, WriteStatePayload } from './interfaces/request.interface';


@WebSocketGateway(3001, {cors: true})
export class RetroGateway {
  @WebSocketServer() server: Server;
  constructor(private gatewayService: GatewayService){}
   
  @SubscribeMessage("connection")
  async handleConnection(client: Socket) {
      const retroId = client.handshake.query.retro_id as string;
      const user = this.gatewayService.getUserFromJWT(client);
      await this.gatewayService.handleConnection(client, retroId, user);
  }

  @SubscribeMessage("command_ready")
  async handleReady(client: Socket, payload: ReadyPayload) {
    this.gatewayService.handleReady(this.server, client, payload.readyState);
  }

  @SubscribeMessage("command_new_card")
  async handleNewCard(client: Socket, payload: NewCardPayload) {
    this.gatewayService.handleNewCard(this.server, client, payload);
  }

  @SubscribeMessage("command_delete_card")
  handleDeleteCard(client: Socket, payload: DeleteCardPayload) {
    this.gatewayService.handleDeleteCard(this.server, client, payload.cardId);
  }

  @SubscribeMessage("command_write_state")
  handleWriteState(client: Socket, payload: WriteStatePayload) {
    this.gatewayService.handleWriteState(this.server, client, payload.writeState);
  }

  @SubscribeMessage("command_room_state")
  handleRoomState(client: Socket, payload: RoomStatePayload){
    this.gatewayService.handleRoomState(this.server, client, payload.roomState);
  }

  @SubscribeMessage("command_change_timer")
  handleChangeTimer(client: Socket, payload: ChangeTimerPayload) {
    this.gatewayService.handleChangeTimer(this.server, client, payload.timestamp);
  }

  // @SubscribeMessage("disconnect")
  // handleDisconnect(payload){
  // }
}