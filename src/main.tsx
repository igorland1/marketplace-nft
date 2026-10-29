import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { enableMocking } from './mocks/browser';
import './index.css';

// socket.io-client (engine.io) captures globalThis.WebSocket when its module is evaluated, so the
// app (router -> realtime hook) must be imported only after MSW has patched WebSocket.
enableMocking()
  .then(() => import('./App'))
  .then(({ App }) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
