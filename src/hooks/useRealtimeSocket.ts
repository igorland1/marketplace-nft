import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { NFT_QUERY_KEYS } from './useNFTs';
import { ORDER_QUERY_KEYS } from './useOrders';
import { CART_QUERY_KEYS } from './useCart';
import { NFTUpdatedEvent, OrderUpdatedEvent } from '@/types';
import { wsUrl } from '@/mocks/socket';

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return sharedSocket;
}

export function useRealtimeSocket() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(() => getSocket().connected);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleNFTUpdated = (event: NFTUpdatedEvent) => {
      queryClient.invalidateQueries({ queryKey: NFT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
      if (event.nftId) {
        queryClient.invalidateQueries({ queryKey: NFT_QUERY_KEYS.detail(event.nftId) });
      }
    };

    const handleOrderUpdated = (event: OrderUpdatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
      if (event.orderId) {
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.detail(event.orderId) });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('nft.updated', handleNFTUpdated);
    socket.on('order.updated', handleOrderUpdated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('nft.updated', handleNFTUpdated);
      socket.off('order.updated', handleOrderUpdated);
    };
  }, [queryClient]);

  return {
    socket: getSocket(),
    isConnected,
  };
}
