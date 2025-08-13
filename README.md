# EdTech Startup — Production-Ready

Монорепозиторий с образовательной платформой. Внутри — веб‑приложение на Next.js 15 с интерактивными уроками, локальной БД SQLite и административной частью. Этот репозиторий является результатом работы по приведению MVP к production-ready виду.

Репозиторий: https://github.com/otakukz17/fluffy-octo-eureka

## Стек
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- SQLite (better-sqlite3) для локальной разработки
- `bcrypt` для хеширования паролей
- `zod` для валидации данных

## Структура
- `mvp-app/` — Next.js приложение
- `.github/workflows/` — CI/CD пайплайны
- `developer/`, `founder/`, `product_manager/` — планы, логи и артефакты

## Быстрый старт

1.  **Клонируйте репозиторий**
    ```bash
    git clone https://github.com/otakukz17/fluffy-octo-eureka.git
    cd fluffy-octo-eureka
    ```

2.  **Установите зависимости**
    Проект использует `npm` для управления зависимостями.
    ```bash
    cd mvp-app
    npm install
    ```

3.  **Настройка базы данных**
    База данных SQLite будет создана автоматически в директории `mvp-app/var/`.

    Примените миграции:
    ```bash
    npm run db:migrate
    ```
    Наполните базу демо-данными:
    ```bash
    npm run db:seed
    ```

4.  **Запуск в dev-режиме**
    ```bash
    npm run dev
    ```
    Приложение откроется на http://localhost:3000

## Скрипты
В `mvp-app/package.json`:
- `dev` — запуск dev‑сервера Next.js
- `build` — сборка
- `start` — запуск продакшн‑сборки
- `lint` — линтинг
- `typecheck` — проверка типов TypeScript
- `db:migrate` — применение миграций к БД
- `db:seed` — наполнение БД демо-данными

## CI/CD
В репозитории настроен CI/CD пайплайн с помощью GitHub Actions (`.github/workflows/ci.yml`). При каждом пуше в `main` или создании pull request запускаются следующие проверки:
- Линтинг
- Проверка типов
- Сборка проекта

## Деплой на Vercel
Проект оптимизирован для деплоя на Vercel.

1.  Создайте новый проект на Vercel и подключите этот репозиторий.
2.  Vercel автоматически определит, что это Next.js проект.
3.  **Важно**: в настройках проекта на Vercel укажите следующие переменные окружения:
    - `DATABASE_URL`: путь к вашей production базе данных (например, PostgreSQL).
    - `SESSION_SECRET`: секретный ключ для подписи сессий.
4.  После деплоя необходимо будет запустить миграции на вашей production базе данных.

## Лицензия
MIT
