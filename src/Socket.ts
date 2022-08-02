import Room from './Room';
import SocketServer from './Server';
import { EventEmitter } from 'events';
interface SocketOptions {
  id: string;
  data?: object;
  parent: SocketServer;
}
export default class Socket extends EventEmitter {
  id: string;
  data?: {};
  parent: SocketServer;
  _rooms: Map<string, Room>;
  constructor({ id, data = {}, parent }: SocketOptions) {
    super();
    this.data = data;
    this.id = id;
    this.parent = parent;
    this._rooms = new Map();
  }
  get rooms(): string[] {
    return Array.from(this._rooms.keys());
  }
  disconnect(): void {
    return this.parent.disconnectSocket(this.id);
  }
  join(roomId: string): Room {
    return this.parent._addSocketToRoom(this, roomId);
  }

  leave(roomId: string): Room | null {
    return this.parent._removeSocketFromRoom(this, roomId);
  }
}
