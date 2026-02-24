import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://192.168.5.42:5173',
      'http://192.168.29.26:5173',
      'http://frontend:5173',
    ],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Example event: Order status update
  @SubscribeMessage('orderStatusUpdate')
  handleOrderStatusUpdate(
    @MessageBody() data: { orderId: string; status: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Order status update: ${data.orderId} -> ${data.status} from ${client.id}`,
    );
    // Broadcast to all clients
    this.server.emit('orderStatusChanged', data);
    return { success: true };
  }

  // Example event: Cart update
  @SubscribeMessage('cartUpdate')
  handleCartUpdate(
    @MessageBody() data: { userId: string; cartData: any },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Cart update for user: ${data.userId} from ${client.id}`);
    // Emit to specific user (if you implement room-based logic)
    client.broadcast.emit('cartUpdated', data);
    return { success: true };
  }

  // Example event: Admin notification
  @SubscribeMessage('adminNotification')
  handleAdminNotification(
    @MessageBody() data: { message: string; type: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Admin notification: ${data.message} from ${client.id}`);
    // Broadcast to all admin clients (you can filter by room)
    this.server.emit('adminAlert', data);
    return { success: true };
  }

  // Utility method to emit events from services
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToClient(clientId: string, event: string, data: any) {
    this.server.to(clientId).emit(event, data);
  }
}
