import { authHandlers } from './auth';
import { nftHandlers } from './nfts';
import { cartHandlers } from './cart';
import { orderHandlers } from './orders';
import { profileHandlers } from './profile';
import { socketHandler } from '../socket';

export const handlers = [
  ...authHandlers,
  ...nftHandlers,
  ...cartHandlers,
  ...orderHandlers,
  ...profileHandlers,
  socketHandler,
];
