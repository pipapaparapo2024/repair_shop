# Веб‑сервис «Заявки в ремонтную службу»

Небольшое веб‑приложение для приёма и обработки заявок в ремонтную службу.  
Стек: Node.js + Express (backend), React + Vite (frontend), SQLite.

## Требования к окружению

- Node.js: **>= 20.19.0 < 21**  
  Рекомендуется использовать `nvm` и файл `.nvmrc` в корне:

```bash
nvm use
```

## Структура проекта

- `backend` — API‑сервер на Express + SQLite
- `frontend` — SPA на React + Vite
- `PROMPTS.md` — все запросы к AI
- `DECISIONS.md` — ключевые решения по архитектуре
- `docker-compose.yml` — запуск backend и frontend через Docker

## Запуск без Docker

### Backend

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

Сервер будет доступен по адресу: `http://localhost:3000`.

Проверка здоровья:

```bash
curl http://localhost:3000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

По умолчанию Vite поднимает dev‑сервер на `http://localhost:5173`.

## Запуск через Docker Compose

В корне проекта:

```bash
docker compose up
```

Будут подняты сервисы:

- `backend` на `http://localhost:3000`
- `frontend` на `http://localhost:5173`

SQLite используется как файловая БД и хранится внутри тома/папки проекта.

## Тестовые пользователи

После выполнения `npm run seed` в backend доступны пользователи:

- `id = 1`, `name = "Dispatcher"`, `role = "dispatcher"`, `password = "password"`
- `id = 2`, `name = "Master 1"`, `role = "master"`, `password = "password"`
- `id = 3`, `name = "Master 2"`, `role = "master"`, `password = "password"`

Авторизация реализована упрощённо через заголовок `x-user-id`.  
На фронтенде это будет выбор пользователя, а в API‑запросах — установка заголовка.

Примеры:

- запрос от диспетчера:

```bash
curl http://localhost:3000/requests -H "x-user-id: 1"
```

- запрос от мастера:

```bash
curl http://localhost:3000/requests/my -H "x-user-id: 2"
```

## Проверка гонки для «Взять в работу»

Эндпойнт:

```text
PATCH /requests/:id/take
Headers: x-user-id: <id_мастера>
```

Корректное поведение при параллельных запросах:

- один мастер успешно переведёт заявку из `assigned` в `in_progress`
- второй получит ошибку `409 Conflict` с сообщением  
  `Request already taken or status changed`

### Как проверить через два терминала

1. Убедиться, что есть заявка в статусе `assigned`, назначенная на мастера с `id = 2`.
   Это можно сделать через сиды или через `PATCH /requests/:id/assign` от диспетчера.
2. В первом терминале:

```bash
curl -X PATCH http://localhost:3000/requests/1/take -H "x-user-id: 2"
```

3. Во втором терминале почти одновременно выполнить ту же команду:

```bash
curl -X PATCH http://localhost:3000/requests/1/take -H "x-user-id: 2"
```

Ожидаемый результат:

- один запрос вернёт заявку со статусом `in_progress`
- второй вернёт ответ `409` и текст ошибки

## Тесты backend

Тесты написаны на Jest и проверяют:

- корректные переходы статусов заявки
- защиту от повторного «взятия в работу» (логика гонки)

Запуск тестов backend:

```bash
cd backend
npm test
```

