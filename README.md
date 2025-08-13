# EdTech Startup — MVP

Монорепозиторий с MVP образовательной платформы. Внутри — веб‑приложение на Next.js 15 с интерактивными уроками, локальной БД SQLite и административной частью.

Репозиторий: https://github.com/otakukz17/fluffy-octo-eureka

## Стек
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- SQLite (better-sqlite3)

## Структура
- `mvp-app/` — Next.js приложение
- `developer/`, `founder/`, `product_manager/` — планы, логи и артефакты

## Быстрый старт
1) Установите Node.js 20+ (LTS)
2) Установка зависимостей
```bash
cd mvp-app
npm install
```
3) Запуск в dev-режиме
```bash
npm run dev
```
Приложение откроется на http://localhost:3000

4) Продакшн-сборка
```bash
npm run build
npm start
```

## Данные и миграции
- Локальная база: `mvp-app/var/data.sqlite` (создаётся автоматически)
- При первом запуске выполняются миграции и автосидинг демо‑курсов/уроков
- `var/` и артефакты сборки исключены из git (`.gitignore`)

## Навигация
- Каталог курсов: `/courses`
- Дэшборд пользователя: `/dashboard`
- Детали курса: `/courses/[id]`
- Урок: `/courses/[id]/lesson/[lessonId]`
- Админка (черновая): `/admin` и вложенные страницы для курсов/уроков

## Скрипты
В `mvp-app/package.json`:
- `dev` — запуск dev‑сервера Next.js
- `build` — сборка
- `start` — запуск продакшн‑сборки
- `lint` — линтинг

## Примечания
- Для macOS может потребоваться установка Xcode Command Line Tools для сборки нативных зависимостей: `xcode-select --install`
- В репозиторий не попадают `node_modules`, `.next`, локальная БД и другие тяжёлые артефакты

## Лицензия
MIT (при необходимости уточните условия для контента курсов)
