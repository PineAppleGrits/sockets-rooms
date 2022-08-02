# <p align="center"> Socket Rooms</p>

<p align="center"><i>Communicate using Sockets, You can also use rooms.</i></p>

## How to use

Import the Socket Server

```js
import SocketServer from 'sockets-rooms';
```

Create a new Socket Server instance

```js
const socketServer = new SocketServer();
```

Create a new Socket instance

```js
const socketServer = new SocketServer();
const socket = socketServer.connect();
```

You can also set custom ids or data

```js
const socketServer = new SocketServer();
const socket = socketServer.connect('myCoolId', {
  mySuperCustomData: { a: 1, b: 2 },
});
```

Emit an event to a specific socket

```js
socketServer.emitTo(
  ['myId1', 'myId2'],
  'excluded_id',
  'event_1',
  'This is cool data'
);
//You can also emit events to rooms. Also the excludedId argument is optional
socketServer.emitTo('room1', undefined, 'event_2', {
  pi: 3.14,
  one: 1,
  two: 2,
});
```

## Rooms

You can create a new room by making a socket join it. Rooms gets autoremoved when there are no sockets on it.

```js
const socketServer = new SocketServer();
const socket1 = socketServer.connect();
const socket2 = socketServer.connect();
socket1.join('room1');
socket1.join('room2');
socket2.join('room1');
socketServer.emitTo('room1', 'room2', 'event_from_room2', 'Hello from room 2');
```

# TODO

[ ] Convert class Room to event emitter so it can work independentally.
