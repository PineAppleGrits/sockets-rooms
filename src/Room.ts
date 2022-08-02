import Socket from './Socket';
interface RoomOptions {
  id: string;
  data?: object;
}
export default class Room {
  data?: object;
  id: string;
  sockets: Map<string, Socket>;
  constructor({ id, data = {} }: RoomOptions) {
    this.data = data;
    this.id = id;
    this.sockets = new Map();
  }
}
