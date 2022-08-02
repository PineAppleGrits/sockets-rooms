import Socket from './Socket';
import Room from './Room';
import { EventEmitter } from 'events';
import SocketServerError from './Errors';
export enum Events {
  DEBUG = 'debug',
  CONNECTION = 'connection',
  DISCONNECTION = 'disconnection',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  CREATE_ROOM = 'create_room',
  DELETE_ROOM = 'delete_room',
}
export default class SocketServer extends EventEmitter {
  connections: Map<string, Socket>;
  rooms: Map<string, Room>;
  constructor() {
    super();
    this.rooms = new Map();
    this.connections = new Map();
  }
  public emitTo(
    ids: string | string[],
    event: string,
    exclude: string | string[] = '',
    ...args: any
  ) {
    let idArrays = ids
      .toString()
      .split(',')
      .filter(
        id =>
          !exclude
            .toString()
            .split(',')
            .includes(id)
      );
    if (idArrays.length < 0)
      throw new SocketServerError(SocketServerError.ROOM_EMPTY);
    let socketIds: string[] = idArrays
      .flatMap(id => {
        let room = this.rooms.get(id);
        if (room) return Array.from(room.sockets.keys());
        let socket = this.connections.get(id);
        if (!socket)
          throw new SocketServerError(SocketServerError.SOCKET_NOT_FOUND(id));
        return id;
      })
      .filter(
        id =>
          !exclude
            .toString()
            .split(',')
            .includes(id)
      );
    for (let id of socketIds) this.emitToSocket(id, event, ...args);
  }
  public connect(id?: string, data: any = {}) {
    let socketId = this.generateId(id);
    let socket = new Socket({
      id: socketId,
      data,
      parent: this,
    });
    this.emit(Events.DEBUG, `Socket ${socket.id} connected`);
    this.connections.set(socketId, socket);
    this.emit(Events.CONNECTION, socket);
    return socket;
  }
  public disconnectSocket(id: string): void {
    let socket = this.connections.get(id);
    if (!socket)
      throw new SocketServerError(SocketServerError.SOCKET_NOT_FOUND(id));
    if (socket._rooms.size > 1)
      for (let roomId of Object.keys(socket._rooms))
        this._removeSocketFromRoom(socket, roomId);
    this.connections.delete(id);
    this.emit(Events.DISCONNECTION, socket);
    this.emit(Events.DEBUG, `Socket ${id} disconnected`);
  }
  public broadcast(event: string, ...args: any): void {
    for (const socketId of this.connections.keys()) {
      this.emitToSocket(socketId, event, ...args);
    }
  }
  public _addSocketToRoom(socket: Socket, roomId: string): Room {
    let room = this.rooms.has(roomId) ? this.rooms.get(roomId) : undefined;
    try {
      if (!room) {
        this.emit(Events.DEBUG, `Creating room ${roomId}`);
        this.emit(Events.CREATE_ROOM, room);
        room = new Room({ id: roomId });
        this.rooms.set(room.id, room);
      }
      room.sockets.set(socket.id, socket);
      socket._rooms.set(room.id, room);
      this.emit(Events.JOIN_ROOM, room, socket);
      this.emit(Events.DEBUG, `Socket ${socket.id} joined room ${roomId}`);
      return room;
    } catch (e) {
      throw new SocketServerError(SocketServerError.UNKNOWN);
    }
  }
  public _removeSocketFromRoom(socket: Socket, roomId: string): Room | null {
    let room = this.rooms.get(roomId);
    try {
      if (!room) {
        throw new SocketServerError(SocketServerError.ROOM_NOT_FOUND(roomId));
      } else {
        room.sockets.delete(socket.id);
        socket._rooms.delete(room.id);
        this.emit(Events.LEAVE_ROOM, room, socket);
        this.emit(Events.DEBUG, `Socket ${socket.id} leaved room ${roomId}`);
        if (room.sockets.size < 1) {
          this.emit(Events.DELETE_ROOM, room);
          this.emit(
            Events.DEBUG,
            `Room ${roomId} has no members, deleting it.`
          );
          this.rooms.delete(room.id);
        }
      }
    } catch (e) {
      throw new SocketServerError(SocketServerError.UNKNOWN);
    } finally {
      let room = this.rooms.get(roomId);
      if (room) return room;
      return null;
    }
  }
  private emitToSocket(id: string, event: string, ...args: any) {
    if (this.connections.has(id)) {
      let socket = this.connections?.get(id);
      if (!socket)
        throw new SocketServerError(SocketServerError.SOCKET_NOT_FOUND(id));
      socket.emit(event, ...args);
    } else throw new SocketServerError(SocketServerError.SOCKET_NOT_FOUND(id));
  }
  private generateId = (id?: string): string => {
    if (id) {
      if (this.connections.has(id))
        throw new SocketServerError(SocketServerError.UNIQUE_ID);
      else return id;
    }

    let generatedId = Math.random()
      .toString(36)
      .substring(2, 10);
    if (this.connections.has(generatedId)) return this.generateId();
    return generatedId;
  };
}
