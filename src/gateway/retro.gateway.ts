import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayService } from './gateway.service';


@WebSocketGateway(3001)
export class RetroGateway {
  constructor(private gatewayService: GatewayService){}
   
  @SubscribeMessage("connection")
  async handleConnection(client: Socket) {
      const retroId = client.handshake.query.retro_id as string;
      const user = this.gatewayService.getUserFromJWT(client);
      await this.gatewayService.handleConnection(client, retroId, user);
  }

  @SubscribeMessage("command_ready")
  async handleReady(client: Socket) {
    this.gatewayService.handleReady(client, true);
  }
}