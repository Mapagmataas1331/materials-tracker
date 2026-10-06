# Exomaterial — учёт материалов на производстве

**Exomaterial** — внутренняя веб-система учёта материалов для производства. Остатки по местам хранения считаются автоматически, приход и списание оформляются за минуты, а список «Требуется закупка» всегда актуален — без Excel и бумажных журналов.

Одно приложение + PostgreSQL + опциональный nginx с HTTPS. Разворачивается на своём сервере предприятия; доступ — из локальной сети, интернет не нужен.

![Экран входа Exomaterial](docs/screenshots/01-login.png)

---

## Возможности

| | |
|---|---|
| **Карточки материалов** | Наименование, категория, единица измерения, минимальный остаток, комментарий. Архив вместо удаления. |
| **Учёт по местам хранения** | Один материал — несколько складов/ячеек; общий остаток считается автоматически. |
| **Поступления и списания** | Приход с количеством, стоимостью, поставщиком и местом; списание со склада. Система **физически не даёт** списать больше, чем есть в наличии — даже при одновременной работе нескольких человек. |
| **Требуется закупка** | Автоматический список позиций ниже минимума или с нулевым остатком, печать и выгрузка CSV. |
| **Журнал операций** | Дата, пользователь, тип, количество, место, поставщик, комментарий и остаток после операции. |
| **Справочники** | Категории, единицы измерения, поставщики, места хранения — в разделе «Настройки». |
| **Роли и доступ** | Администратор и пользователь; отключение учётки без потери истории. Вход по логину и паролю (Argon2id). |
| **Адаптивный UI** | Удобно с ПК, планшета и телефона; светлая/тёмная тема. |

![Каталог материалов](docs/screenshots/02-materials.png)

![Список «Требуется закупка»](docs/screenshots/03-purchase-list.png)

![Журнал операций](docs/screenshots/04-journal.png)

---

## Содержание

- [Возможности](#возможности)
- [Скриншоты](#скриншоты)
- [Требования](#требования)
- [Готовые варианты запуска](#готовые-варианты-запуска)
- [Установка на сервере](#установка-на-сервере)
- [HTTPS и сертификат](#https-и-сертификат)
- [Первый администратор](#первый-администратор)
- [Переменные окружения](#переменные-окружения)
- [Обновление и пересборка](#обновление-и-пересборка)
- [Резервное копирование](#резервное-копирование)
- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Разработка](#разработка)

---

## Скриншоты

| Экран | Файл |
|---|---|
| Вход в систему | [`docs/screenshots/01-login.png`](docs/screenshots/01-login.png) |
| Материалы | [`docs/screenshots/02-materials.png`](docs/screenshots/02-materials.png) |
| Требуется закупка | [`docs/screenshots/03-purchase-list.png`](docs/screenshots/03-purchase-list.png) |
| Журнал операций | [`docs/screenshots/04-journal.png`](docs/screenshots/04-journal.png) |
| Поступления | [`docs/screenshots/05-receipts.png`](docs/screenshots/05-receipts.png) |

> Демо-учётки (только для скриншотов / локальной демонстрации): `admin` / `admin` и `user` / `user`. На боевом сервере задайте свои пароли.

---

## Требования

На сервере достаточно:

- **Docker** 24+
- **Docker Compose** (`docker compose`)

PostgreSQL и приложение поднимаются контейнерами — отдельный Node.js на хосте не нужен.

## Готовые варианты запуска

Один `docker-compose.yml` — два режима через `COMPOSE_PROFILES` в `.env` (без правки compose):

| Вариант | `COMPOSE_PROFILES` | Что поднимается | Когда |
|---|---|---|---|
| **Стандартный** | `proxy` | `db` + `app` + `proxy` (nginx, HTTPS на 80/443) | На сервере свободны 80/443 — HTTPS «из коробки» |
| **Без встроенного прокси** | *(пусто)* | только `db` + `app`, приложение на `127.0.0.1:3000` | Уже есть свой nginx/reverse proxy — направьте его на `127.0.0.1:3000` |

Сервисы в compose: **`db`** (PostgreSQL 16), **`app`** (Next.js), **`proxy`** (nginx, профиль `proxy`). Других сервисов нет.

## Установка на сервере

1. **Скопируйте проект** на сервер (`git clone`, `scp` или архив).

2. **Создайте `.env`** из примера:

   ```bash
   cp .env.example .env
   ```

3. **Заполните обязательные переменные:**

   | Переменная | Что указать |
   |---|---|
   | `COMPOSE_PROFILES` | `proxy` (стандарт) или пусто (свой reverse proxy) |
   | `POSTGRES_PASSWORD` | Надёжный пароль БД |
   | `AUTH_SECRET` | Случайная строка: `openssl rand -base64 32` (или `npx auth secret`) |
   | `AUTH_URL` | Публичный URL системы **с `https://`**, например `https://materials.company.local` или `https://192.168.1.10` |

   `DATABASE_URL` в `.env` для Docker-запуска **менять не нужно**: контейнер `app` ходит в БД по имени хоста `db` внутри Docker-сети (см. `docker-compose.yml`). Значение из `.env` нужно для локальных скриптов вне Compose.

4. **Сертификат HTTPS** — только для варианта с `proxy`. См. [HTTPS и сертификат](#https-и-сертификат). Без встроенного прокси этот шаг пропустите.

5. **Сборка и старт:**

   ```bash
   docker compose up -d --build
   ```

   При первом запуске Compose соберёт образ приложения, поднимет PostgreSQL, дождётся healthcheck, применит миграции (entrypoint `docker/entrypoint.sh` → `npm run db:migrate`) и стартует `app` (и `proxy`, если включён профиль). База создаётся **пустой** — без пользователей и материалов.

6. **Проверка:**

   ```bash
   docker compose ps
   docker compose logs -f app
   ```

   Ожидаются `db` / `app` (и `proxy`) в состоянии `Up` / `healthy`.

7. Откройте `AUTH_URL` в браузере. В стандартном варианте это `https://…` (порт 443 указывать не нужно). Самоподписанный сертификат браузер один раз предупредит — для внутренней сети это нормально («Дополнительно» → «Всё равно перейти»). Дальше — [создание администратора](#первый-администратор).

## HTTPS и сертификат

Только для `COMPOSE_PROFILES=proxy`. HTTPS терминирует сервис **`proxy`** (`nginx:alpine`): слушает 80/443, редиректит HTTP→HTTPS, проксирует на `app:3000` (`docker/nginx.conf`). Файлы `server.crt` / `server.key` монтируются из `docker/certs/` (в git не хранятся — см. `.gitignore`).

**Самоподписанный сертификат** (внутренняя сеть):

```bash
openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout docker/certs/server.key \
  -out docker/certs/server.crt \
  -days 825 -subj "/CN=materials-tracker.local"
```

Без `openssl` на хосте:

```bash
docker run --rm -v "$(pwd)/docker/certs:/certs" alpine/openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout /certs/server.key -out /certs/server.crt -days 825 -subj "/CN=materials-tracker.local"
```

**Свой сертификат** (внутренний УЦ / домен): положите файлы как `docker/certs/server.crt` и `docker/certs/server.key` (или обновите пути в `docker/nginx.conf`).

После появления файлов: `docker compose up -d proxy` (или полный `up -d --build`).

> **Важно:** `AUTH_URL` должен совпадать с тем адресом, по которому пользователи открывают систему (схема + хост). Иначе Auth.js сломает callback’и сессии.

## Первый администратор

Публичной регистрации нет. Первую учётку создайте в контейнере:

```bash
docker compose exec -it app npm run create-admin
```

Скрипт спросит ФИО, логин и пароль (минимум 8 символов). Неинтерактивно:

```bash
docker compose exec app npm run create-admin -- \
  --full-name="Иван Иванов" --login=admin --password="ЗамениНаНадёжныйПароль"
```

Дальше:

1. Войдите под созданной учёткой.
2. **Пользователи** — заведите остальных сотрудников.
3. **Настройки** — категории, единицы, поставщики, места хранения.
4. **Материалы** и **Поступления** — каталог и фактические остатки.

Повторный `create-admin` с занятым логином отклоняется — дальше управляйте через UI.

## Переменные окружения

Полный список — в [`.env.example`](.env.example). Кратко:

| Переменная | Назначение |
|---|---|
| `COMPOSE_PROFILES` | `proxy` или пусто — см. варианты запуска |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL внутри Docker-сети |
| `AUTH_SECRET` | Секрет подписи сессионных cookie (длинный, случайный) |
| `AUTH_URL` | Публичный URL системы с `https://` (или `http://localhost:3000` в разработке) |
| `DATABASE_URL` | Подключение к БД для скриптов **вне** Docker |
| `NODE_ENV` | В Compose для `app` задаётся `production` |

Секреты живут только в окружении / `.env`, не в исходниках.

## Обновление и пересборка

**Полное обновление** (код + образ приложения; БД и том `db_data` сохраняются):

```bash
git pull
docker compose up -d --build
```

Миграции применяются при старте контейнера `app` (`docker/entrypoint.sh`). Материалы, остатки, журнал и пользователи не теряются.

**Пересборка только приложения** (типичный случай после правок UI/логики — без трогания БД и nginx):

```bash
docker compose up -d --build app
```

Том `db_data` и конфиг `docker/nginx.conf` при этом не затрагиваются. Перезапускать `proxy` нужно только если меняли сертификаты или `nginx.conf`.

## Резервное копирование

```bash
docker compose exec db pg_dump -U materials_app materials > backup_$(date +%Y-%m-%d).sql
```

Храните дампы отдельно от сервера (диск / файловый шаринг). Восстановление:

```bash
cat backup_2026-08-08.sql | docker compose exec -T db psql -U materials_app -d materials
```

## Технологии

- **Next.js** + **React** + **TypeScript** — UI и сервер в одном проекте
- **PostgreSQL 16** — данные
- **Drizzle ORM** — схема и миграции
- **Auth.js** — сессии; пароли — **Argon2id**
- **shadcn/ui** + **Tailwind CSS** — интерфейс
- **Docker Compose** — `db` + `app` + опциональный `proxy` (nginx HTTPS)

## Структура проекта

```
├── docker/
│   ├── certs/              # TLS для nginx (не в git)
│   ├── nginx.conf          # HTTPS → app:3000
│   ├── entrypoint.sh       # db:migrate → npm start
│   └── init-extensions.sql # расширения Postgres при первом старте тома
├── docs/screenshots/       # скриншоты для README
├── drizzle/                # SQL-миграции
├── src/
│   ├── app/                # страницы (App Router)
│   ├── components/         # UI
│   ├── db/                 # схема, migrate, create-admin
│   ├── lib/                # auth, валидация, утилиты
│   └── server/             # actions + services
├── Dockerfile
├── docker-compose.yml      # db + app + proxy (profile)
├── docker-compose.override.yml  # только локальная разработка (порт 5432)
└── .env.example
```

## Разработка

Для доработки кода (не для прод-сервера). Нужны Node.js 22+ и Docker (для Postgres).

```bash
npm install
cp .env.example .env
# Для локальной разработки без HTTPS:
#   AUTH_URL=http://localhost:3000
#   COMPOSE_PROFILES=   (пусто)

docker compose -f docker-compose.yml -f docker-compose.override.yml up -d db

npm run db:migrate
npm run create-admin
npm run dev
```

Полезные команды:

```bash
npm run lint
npm run build
npm run test
npm run db:generate    # после изменения src/db/schema.ts
npm run db:studio
npm run create-admin
```

`docker-compose.override.yml` открывает Postgres на `localhost:5432` и **не должен** использоваться на сервере предприятия — на проде достаточно одного `docker-compose.yml`.
