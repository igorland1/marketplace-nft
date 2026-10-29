import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { NFTUpdatedEvent, OrderUpdatedEvent } from '@/types';

// Connect using relative / same origin ws
export const wsUrl = 'wss://greenmint.local/socket.io';
const chatWs = ws.link(wsUrl);

// Keep track of active mock socket clients to broadcast events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeClients = new Set<any>();

export const socketHandler = chatWs.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection);
  activeClients.add(io);

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
