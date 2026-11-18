import { handleRaffleRequest } from './raffle.mjs';

export default function rafflePlugin() {
  return {
    name: 'raffle-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleRaffleRequest(req, res).then((handled) => {
          if (!handled) next();
        });
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleRaffleRequest(req, res).then((handled) => {
          if (!handled) next();
        });
      });
    },
  };
}
