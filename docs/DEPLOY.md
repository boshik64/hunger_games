# Деплой

Сайт — статика + **обязательный** Node-процесс (`pnpm start` / `scripts/serve.mjs`) для:

- розыгрыша `/api/raffle*` → `raffle-participants.json`
- кликов `POST /api/stats` → `data/clicks.json`
- дашборда `/stats` (`GET /api/stats`, логин `/api/stats/session`, капча `/api/stats/captcha`)

Капча локальная (арифметика), без Google. Если nginx отдаёт `index.html` на `/api/*`, розыгрыш и запись кликов ломаются, `/stats` не откроется.

## Сборка

```bash
git pull origin main
pnpm install
# В .env на сервере (не в git):
# STATS_PASSWORD=...   # пароль страницы /stats
# VITE_* при необходимости уже зашиты в билд — менять до pnpm build
pnpm build
```

Перезапустить процесс Node после деплоя (systemd/pm2), иначе останется старый `serve.mjs` без `/api/stats` для кликов и `/stats`.

## Запуск API + статики

```bash
PORT=4173 pnpm start
# node scripts/serve.mjs — dist/, raffle-participants.json, data/clicks.json, /stats API
```

## Nginx

Не отдавать `/api/` как SPA-fallback. Проксировать на Node:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:4173;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
  proxy_pass http://127.0.0.1:4173;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Либо весь сайт только через `pnpm start` (проще).

## Проверка

```bash
curl -s https://<домен>/api/raffle/captcha
# JSON {"id":"...","challenge":"3 + 5",...}, не HTML

curl -s -o /dev/null -w '%{http_code}\n' https://<домен>/api/stats
# 401 без cookie

curl -s https://<домен>/api/stats/captcha
# JSON {"id":"...","challenge":"..."}
```

Открыть `https://<домен>/stats`, войти паролем из `STATS_PASSWORD` + капча. Клики должны появляться в `data/clicks.json` после нажатий на сайте.

## Данные на сервере

| Файл | Содержимое |
|---|---|
| `raffle-participants.json` | коды брони розыгрыша |
| `data/clicks.json` | счётчики и журнал кликов |
| `.env` | `STATS_PASSWORD` и прочие env (не коммитить) |
