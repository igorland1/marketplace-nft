import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { NFTUpdatedEvent, OrderUpdatedEvent } from '@/types';

// socket.io-client appends its default path (/socket.io/) to this origin
export const wsUrl = 'wss://greenmint.local';
const chatWs = ws.link('wss://greenmint.local/*');

// Keep track of active mock socket clients to broadcast events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeClients = new Set<any>();

export const socketHandler = chatWs.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection);

  activeClients.add(io);

  // engine.io heartbeat: the server pings, the client answers with a pong
  const heartbeat = setInterval(() => connection.client.send('2'), 20000);
  connection.client.addEventListener('close', () => clearInterval(heartbeat));

  io.client.on('disconnect', () => {
    activeClients.delete(io);
  });

  io.client.on('error', () => {
    activeClients.delete(io);
  });
});

export function emitNFTUpdated(event: NFTUpdatedEvent) {
  for (const client of activeClients) {
    try {
      client.emit('nft.updated', event);
    } catch {
      activeClients.delete(client);
    }
  }
}

export function emitOrderUpdated(event: OrderUpdatedEvent) {
  for (const client of activeClients) {
    try {
      client.emit('order.updated', event);
    } catch {
      activeClients.delete(client);
    }
  }
}
