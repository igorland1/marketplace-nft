import { authHandlers } from './auth';
import { nftHandlers } from './nfts';
import { cartHandlers } from './cart';
import { orderHandlers } from './orders';
import { profileHandlers } from './profile';
import { socketHandler } from '../socket';
import { resetHandler } from './reset';

export const handlers = [
  ...authHandlers,
  ...nftHandlers,
  ...cartHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...resetHandler,
  socketHandler,
];
