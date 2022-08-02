import SocketServer from '../src';

describe('broadcast', () => {
  it('works', () => {
    const master = new SocketServer();
    let socket = master.connect();
    let aNumber = 234124;
    socket.on('event_1', data => {
      expect(data).toEqual(aNumber);
    });
    master.broadcast('event_1', aNumber);
  });
});
