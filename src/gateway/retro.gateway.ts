import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayService } from './gateway.service';


@WebSocketGateway(3001)
export class RetroGateway {
  constructor(private gatewayService: GatewayService){}
   
  @SubscribeMessage("command_join")
  async handleJoin(client: Socket) {
      const retroId = client.handshake.query.retro_id as string;
      const user = this.gatewayService.getUserFromJWT(client);
      await this.gatewayService.handleJoin(client, retroId, user);
  }
}