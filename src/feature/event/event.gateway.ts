import { WebSocketGateway, OnGatewayConnection, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ReqSession } from '../auth/types/request-session';

@WebSocketGateway()
export class EventGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;

  handleConnection(client: Socket) {
    const sess = (client.handshake as any).session as ReqSession;
    sess.socketioId = client.id;
    (sess as any).save();
    client.join(sess.username);
  }

  notifyNewMessage(username1: string, username2: string, messageId: number) {
    // For compatibility with legacy APIs
    this.server.to(username1).emit('message', { sender: username2, id: messageId });
    this.server.to(username2).emit('message', { sender: username1, id: messageId });
  }

  disconnect(socketioId: string) {
    this.server.sockets.sockets.get(socketioId).disconnect();
  }
}
