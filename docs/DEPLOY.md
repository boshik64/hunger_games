# Деплой

Сайт — статика + **обязательный** Node-процесс для розыгрыша (`/api/raffle`). Капча локальная (арифметика), без Google — к РФ не привязана. Если nginx отдаёт `index.html` на `/api/*`, форма пишет «сервер розыгрыша недоступен».

## Сборка

```bash
git pull origin main
pnpm install
pnpm build
```

## Запуск API + статики

```bash
PORT=4173 pnpm start
# node scripts/serve.mjs — раздаёт dist/ и пишет raffle-participants.json
```

Держать процесс через systemd/pm2.

## Nginx

Не отдавать `/api/` как SPA-fallback. Проксировать на Node:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:4173;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}

location / {
  proxy_pass http://127.0.0.1:4173;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
}
```

Либо весь сайт только через `pnpm start` (проще).

Проверка:

```bash
curl -s https://<домен>/api/raffle/captcha
# должен быть JSON вида {"id":"...","challenge":"3 + 5",...}, не HTML
```

Участники: `raffle-participants.json` в корне репозитория на сервере.
