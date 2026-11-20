import { handleStatsRequest } from './stats.mjs';

function attach(server) {
  server.middlewares.use((req, res, next) => {
    void handleStatsRequest(req, res).then((handled) => {
      if (!handled) next();
    });
  });
}

export default function statsPlugin() {
  return {
    name: 'click-stats',
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
