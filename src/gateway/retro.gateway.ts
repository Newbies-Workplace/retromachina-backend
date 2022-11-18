import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayService } from './gateway.service';


@WebSocketGateway(3001)
export class RetroGateway {
  constructor(private gatewayService: GatewayService){}

  @SubscribeMessage("connection")
  handleConnection(client: Socket) {
    const retroId = client.handshake.query.retroId as string;
    const user = this.gatewayService.getUserFromJWT(
      client.handshake.headers.authorization
    );
    this.gatewayService.checkUserCreds(retroId, user);
  }

  @SubscribeMessage("command_join")
  async handleJoin(client: Socket) {
      const retroId = client.handshake.query.retroId as string;
      const user = this.gatewayService.getUserFromJWT(
        client.handshake.headers.authorization
      );
      await this.gatewayService.handleJoin(client, retroId, user);
  }
}