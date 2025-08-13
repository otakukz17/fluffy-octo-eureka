import { db } from '../lib/db';

function upgradeIntroFrontendIfNeeded() {
  // If an old Frontend course exists (with YouTube lessons) — rewrite to intro interactive
  try {
    const front = db.prepare("SELECT id, title, price_cents FROM courses WHERE title LIKE 'Frontend React разработчик:%' LIMIT 1").get() as any
    if (!front) return
    // Check if already upgraded (has any content_json)
    const hasInteractive = (db.prepare('SELECT COUNT(1) as c FROM lessons WHERE course_id = ? AND content_json IS NOT NULL').get(front.id) as any).c > 0
    if (hasInteractive) return

    // Replace course meta to intro version
    db.prepare('UPDATE courses SET title = ?, description = ?, price_cents = ? WHERE id = ?').run(
      'Вводный курс: Frontend разработка — подходит ли вам?',
      'О профессии фронтендера: чем занимаетесь, базовая теория и мини‑практика. Поможет понять, нравится ли эта сфера.',
      0,
      front.id,
    )

    // Remove old lessons
    db.prepare('DELETE FROM lessons WHERE course_id = ?').run(front.id)

    // Insert new interactive lessons
    const insertLesson = db.prepare(
      'INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)'
    )
    const updateLesson = db.prepare(
      'UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?'
    )
    const rnd = () => Math.random().toString(36).slice(2, 12)

    const longTheory = (title: string) => ({
      type: 'theory',
      title,
      text: [
        'Фронтенд — это слой взаимодействия между человеком и продуктом. Вы отвечаете за удобство, скорость и доступность.',
        'Интерфейсы строятся из HTML (структура), CSS (вид), JavaScript (логика).',
        'Бизнес-задачи декомпозируются в пользовательские истории: кому, зачем, как измеряем.',
        'Рабочий процесс: бэклог → планирование → разработка → ревью → релиз → мониторинг.',
        'Качество интерфейса: предсказуемость, обратная связь, скорость, доступность.',
        'Стили кода и договорённости команды минимизируют стоимость поддержки.',
        'Производительность начинается с дизайна: простая иерархия, повторное использование компонентов.',
        'Отладка: DevTools, профайлеры React, lighthouse, web vitals.',
        'Доступность: семантика, фокус, aria‑атрибуты, контрастность.',
        'Тестирование: юнит, интеграционные, e2e — баланс издержек и пользы.',
        'Архитектура фронтенда: композиция, инверсия зависимостей, разделение ответственности.',
        'Состояние: локальное vs серверное; кэш и инвалидация.',
        'Сборка и деплой: CI/CD, фиче‑флаги, мониторинг ошибок.',
        'Коммуникации: как писать задачи и ревью, чтобы ускорять команду.',
        'Рост: техдолг, эволюция дизайн‑системы, наставничество.',
      ].join('\n\n')
    })

    // Урок 1: Профессия и основы
    const blocks1: any[] = [longTheory('Кто такой фронтендер')]
    blocks1.push(
      { type: 'quiz_mcq', title: 'Роль', question: 'Что делает фронтендер?', options: ['База данных', 'Клиентский интерфейс', 'Серверное администрирование'], correctIndex: 1 },
      { type: 'monaco', title: 'JS основы: функции', language: 'javascript', starter: 'export const sum=(a,b)=>a+b', hiddenTests: [ { name: 'sum(2,3)=5', code: 'return /sum\(\s*a\s*,\s*b\s*\)/.test(code)' } ] },
      { type: 'code_task', title: 'Семантика', prompt: 'Опишите, какие теги выберёте для шапки сайта и почему', starter: '', checkRegex: '(header|nav|main|footer)', tips: ['Подумайте про nav/ul/li, header/main/footer'] },
      { type: 'reflection', title: 'Оценка интереса', prompt: 'Что в этой роли вам ближе всего и почему?' },
    )
    while (blocks1.length < 16) {
      blocks1.push({ type: 'quiz_mcq', title: 'Быстрый чек', question: 'Что отвечает за стили?', options: ['HTML', 'CSS', 'JS'], correctIndex: 1 })
    }

    // Урок 2: HTML/CSS/JS на практике
    const blocks2: any[] = [longTheory('HTML/CSS/JS в одной картинке')]
    const makeRunner = (title: string, html: string, css: string, js: string, test: string) => ({ type: 'code_runner', title, initialHtml: html, initialCss: css, initialJs: js, testScript: test })
    blocks2.push(
      makeRunner('Кнопка с hover', '<button id="buy">Купить</button>', '#buy{background:#2563EB;color:#fff;padding:.5rem 1rem;border:none;border-radius:.5rem}#buy:hover{filter:brightness(.9)}', '', 'const b=document.querySelector("#buy");window.__OK=!!b && getComputedStyle(b).backgroundColor!==""'),
      makeRunner('Алерт по клику', '<button id="t">Нажми</button>', '', 'document.querySelector("#t").addEventListener("click",()=>window.clicked=true)', 'window.__OK=!!window.clicked'),
      makeRunner('Табы', '<div class="tab" data-i="1">A</div><div class="tab" data-i="2">B</div><div id="out"></div>', '.tab{display:inline-block;padding:8px;border:1px solid #ddd;cursor:pointer}', 'document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{document.querySelector("#out").textContent=t.dataset.i}))', 'const tabs=document.querySelectorAll(".tab");tabs[1].click();window.__OK=document.querySelector("#out").textContent==="2"'),
      { type: 'monaco', title: 'Функции массива', language: 'javascript', starter: 'export const onlyEven=(xs)=>xs.filter(x=>x%2===0)', hiddenTests: [ { name: 'even works', code: 'try{eval(code);return typeof onlyEven==="function" && onlyEven([1,2,3,4]).join(",")==="2,4"}catch(e){return false}' } ] },
    )
    while (blocks2.length < 16) {
      blocks2.push(makeRunner('Карточка', '<div id="c">Текст</div>', '#c{padding:12px;border:1px solid #ddd;border-radius:8px}', '', 'window.__OK=!!document.querySelector("#c")'))
    }

    // Урок 3: Процесс
    const blocks3: any[] = [longTheory('Рабочий процесс фронтенда')]
    blocks3.push(
      { type: 'monaco', title: 'Чистая функция', language: 'javascript', starter: 'export const inc=(x)=>x+1', hiddenTests: [ { name: 'inc(1)=2', code: 'try{eval(code);return inc(1)===2}catch(e){return false}' } ] },
      { type: 'code_task', title: 'Чек-лист PR', prompt: 'Сформируйте чек-лист ревью фронтенд‑PR', starter: '', checkRegex: '.{80,}', tips: ['Покрытие тестами, accessibility, перфоманс, UX‑regress'] },
      { type: 'quiz_mcq', title: 'Git‑флоу', question: 'Что корректно?', options: ['prod правим на сервере', 'feature branch → PR → review → merge', 'всегда push --force'], correctIndex: 1 },
    )
    while (blocks3.length < 16) {
      blocks3.push({ type: 'quiz_mcq', title: 'Процесс', question: 'Кто владелец UX‑требований?', options: ['Случайный разработчик', 'Команда/PM/Дизайнер', 'Случайный пользователь'], correctIndex: 1 })
    }

    const lessons = [
      { title: 'О профессии фронтенд‑разработчика: роль, задачи, инструменты', duration_min: 40, blocks: blocks1 },
      { title: 'База: как устроены HTML, CSS и JS', duration_min: 50, blocks: blocks2 },
      { title: 'День из жизни и следующий шаг', duration_min: 40, blocks: blocks3 },
    ]

    lessons.forEach((l, i) => {
      const lid = rnd()
      insertLesson.run(lid, front.id, l.title, null, i + 1)
      updateLesson.run(l.duration_min, null, JSON.stringify(l.blocks), lid)
    })
  } catch {}
}

function upgradeIntroAnalyticsIfNeeded() {
  try {
    const course = db.prepare("SELECT id, title FROM courses WHERE title LIKE 'Аналитик данных:%' LIMIT 1").get() as any
    if (!course) return
    const hasInteractive = (db.prepare('SELECT COUNT(1) as c FROM lessons WHERE course_id = ? AND content_json IS NOT NULL').get(course.id) as any).c > 0
    if (hasInteractive) return

    db.prepare('UPDATE courses SET title = ?, description = ?, price_cents = 0 WHERE id = ?').run(
      'Вводный курс: Аналитика данных — ваша ли это сфера?',
      'О роли аналитика, базовая статистика/SQL и мини‑практика. Поможет понять — продолжать ли обучение.',
      course.id,
    )

    db.prepare('DELETE FROM lessons WHERE course_id = ?').run(course.id)
    const insertLesson = db.prepare('INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)')
    const updateLesson = db.prepare('UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?')
    const rnd = () => Math.random().toString(36).slice(2, 12)

    const l1 = [
      { type: 'theory', title: 'Роль аналитика', text: 'Отвечает за ответы на бизнес‑вопросы данными: SQL‑запросы, отчеты, эксперименты.' },
      { type: 'quiz_mcq', title: 'Понимание роли', question: 'Что делает аналитик?', options: ['Пишет только бэк‑энд', 'Ищет ответы на вопросы с помощью данных', 'Тестирует UI'], correctIndex: 1 },
      { type: 'reflection', title: 'Оценка интереса', prompt: 'Какие продуктовые метрики вы встречали? Что хотели бы измерять?' },
    ]
    const l2 = [
      { type: 'theory', title: 'Мини‑SQL без установки', text: 'SELECT столбцы FROM таблица WHERE условие; GROUP BY; ORDER BY.' },
      { type: 'quiz_mcq', title: 'Синтаксис', question: 'Какой оператор группирует строки?', options: ['ORDER BY', 'GROUP BY', 'JOIN'], correctIndex: 1 },
      { type: 'code_task', title: 'Псевдо‑задание', prompt: 'Напишите SELECT, который выберет name из users', starter: 'SELECT ... FROM users;', checkRegex: '^SELECT\s+name\s+FROM\s+users;?$', tips: ['Используйте SELECT name FROM users;'] },
    ]
    const l3 = [
      { type: 'theory', title: 'Метрики продукта и A/B', text: 'DAU/WAU/MAU, конверсия, удержание. Эксперименты сравнивают варианты.' },
      { type: 'quiz_mcq', title: 'Метрики', question: 'Что измеряет конверсия?', options: ['Скорость сервера', 'Долю пользователей, совершивших целевое действие', 'Расход памяти'], correctIndex: 1 },
      { type: 'reflection', title: 'Вывод', prompt: 'Хочется ли вам работать с цифрами и гипотезами ежедневно? Почему?' },
    ]

    const lessons = [
      { title: 'О профессии аналитика: чем занимаетесь и где работаете', duration_min: 30, blocks: l1 },
      { title: 'Мини‑SQL без установки', duration_min: 40, blocks: l2 },
      { title: 'Метрики продукта и A/B: стоит ли вам это', duration_min: 25, blocks: l3 },
    ]

    lessons.forEach((l, i) => {
      const lid = rnd()
      insertLesson.run(lid, course.id, l.title, null, i + 1)
      updateLesson.run(l.duration_min, null, JSON.stringify(l.blocks), lid)
    })
  } catch {}
}

function upgradeIntroUxIfNeeded() {
  try {
    const course = db.prepare("SELECT id, title FROM courses WHERE title LIKE 'UX/UI дизайн:%' LIMIT 1").get() as any
    if (!course) return
    const hasInteractive = (db.prepare('SELECT COUNT(1) as c FROM lessons WHERE course_id = ? AND content_json IS NOT NULL').get(course.id) as any).c > 0
    if (hasInteractive) return

    db.prepare('UPDATE courses SET title = ?, description = ?, price_cents = 0 WHERE id = ?').run(
      'Вводный курс: UX/UI дизайн — попробуйте на практике',
      'Кто такой продуктовый дизайнер, основы UX и мини‑практика прототипирования. Для понимания “мое/не мое”.',
      course.id,
    )

    db.prepare('DELETE FROM lessons WHERE course_id = ?').run(course.id)
    const insertLesson = db.prepare('INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)')
    const updateLesson = db.prepare('UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?')
    const rnd = () => Math.random().toString(36).slice(2, 12)

    const a1 = [
      { type: 'theory', title: 'Задачи дизайнера', text: 'Исследование, прототипирование, проверка гипотез, визуальный стиль.' },
      { type: 'quiz_mcq', title: 'Понимание роли', question: 'Что не относится к задачам дизайнера?', options: ['Рисовать UI', 'Планировать спринт команды', 'Проводить пользовательские интервью'], correctIndex: 1 },
      { type: 'reflection', title: 'Оценка интереса', prompt: 'Какие интерфейсы вы хотели бы улучшить? Почему?' },
    ]
    const a2 = [
      { type: 'theory', title: 'UX‑принципы', text: 'Ясность, иерархия, доступность, обратная связь.' },
      { type: 'quiz_mcq', title: 'Иерархия', question: 'Что помогает выстроить визуальную иерархию?', options: ['Типографика и отступы', 'Цвета кода', 'Размер файла'], correctIndex: 0 },
      { type: 'code_task', title: 'Мини‑практика (описательная)', prompt: 'Опишите, как вы построите экран “Регистрация” с фокусом на ясность', starter: '', checkRegex: '.{50,}', tips: ['Опишите поля, состояния ошибок, подсказки, CTA'] },
    ]
    const a3 = [
      { type: 'theory', title: 'День из жизни дизайнера', text: 'Стендап, работа над задачей, синк с разработкой, проверка гипотез.' },
      { type: 'reflection', title: 'Вывод', prompt: 'Понравился ли подход к решению задач через исследования и прототипы?' },
    ]

    const lessons = [
      { title: 'О профессии продуктового дизайнера', duration_min: 30, blocks: a1 },
      { title: 'Базовые принципы UX и практическая зарисовка', duration_min: 45, blocks: a2 },
      { title: 'Итог: день из жизни дизайнера', duration_min: 20, blocks: a3 },
    ]

    lessons.forEach((l, i) => {
      const lid = rnd()
      insertLesson.run(lid, course.id, l.title, null, i + 1)
      updateLesson.run(l.duration_min, null, JSON.stringify(l.blocks), lid)
    })
  } catch {}
}

function enrichCoursesIfNeeded() {
  // Add extra lessons to make intros richer, without deleting existing ones
  try {
    const rnd = () => Math.random().toString(36).slice(2, 12)

    // Frontend enrich to 6 lessons
    const fe = db.prepare("SELECT id FROM courses WHERE title LIKE 'Вводный курс: Frontend%' LIMIT 1").get() as any
    if (fe) {
      const count = (db.prepare('SELECT COUNT(1) as c FROM lessons WHERE course_id = ?').get(fe.id) as any).c as number
      const insertLesson = db.prepare('INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)')
      const updateLesson = db.prepare('UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?')
      if (count < 6) {
        const startPos = count + 1
        const b4 = [
          { type: 'theory', title: 'DOM и события', text: 'DOM предоставляет доступ к элементам, события – способ реагировать на действия пользователя.' },
          { type: 'code_runner', title: 'Кнопка‑переключатель', initialHtml: '<button id="t">Включить</button><div id="box" style="width:80px;height:40px;background:#eee"></div>', initialCss: '#box.on{background:#22c55e}', initialJs: 'document.querySelector("#t").addEventListener("click",()=>{const b=document.querySelector("#box");b.classList.toggle("on"); const t=document.querySelector("#t"); t.textContent = b.classList.contains("on")?"Выключить":"Включить"})', testScript: 'const btn=document.querySelector("#t");btn.click();const on=document.querySelector("#box").classList.contains("on");window.__OK=on;window.__MSG=on?"OK":"Нет реакции на клик";' },
        ]
        const b5 = [
          { type: 'theory', title: 'Flex/Grid и адаптив', text: 'Flexbox для одномерных раскладок, Grid для двумерных. Медиа‑запросы помогают адаптировать интерфейс.' },
          { type: 'code_runner', title: 'Сетка карточек', initialHtml: '<div id="cards"><div class="c">1</div><div class="c">2</div><div class="c">3</div></div>', initialCss: '#cards{display:grid;gap:8px;grid-template-columns:repeat(3,1fr)}@media(max-width:600px){#cards{grid-template-columns:1fr}} .c{background:#f3f4f6;padding:12px;border-radius:8px}', initialJs: '', testScript: 'const s=getComputedStyle(document.querySelector("#cards")).display;window.__OK=s==="grid";window.__MSG=window.__OK?"OK":"Ожидался display:grid";' },
        ]
        const b6 = [
          { type: 'theory', title: 'Мини‑проект: лендинг', text: 'Соберите заголовок, подзаголовок, CTA и блок преимуществ. Стилизация — Tailwind или plain CSS.' },
          { type: 'code_runner', title: 'Скелет лендинга', initialHtml: '<main><h1 id="h">Заголовок</h1><p>Подзаголовок</p><a id="cta" href="#">Начать</a></main>', initialCss: 'main{font-family:system-ui;padding:20px}#cta{display:inline-block;background:#111;color:#fff;padding:.5rem 1rem;border-radius:.5rem}', initialJs: '', testScript: 'window.__OK=!!document.querySelector("#h")&&!!document.querySelector("#cta");window.__MSG=window.__OK?"OK":"Нужны h1 и #cta";' },
        ]
        const list = [
          { title: 'DOM и события на практике', duration_min: 40, blocks: b4 },
          { title: 'Макеты на Flex/Grid, адаптивность', duration_min: 45, blocks: b5 },
          { title: 'Мини‑проект: собрать простой лендинг', duration_min: 60, blocks: b6 },
        ]
        list.forEach((l, i) => {
          const lid = rnd()
          insertLesson.run(lid, fe.id, l.title, null, startPos + i)
          updateLesson.run(l.duration_min, null, JSON.stringify(l.blocks), lid)
        })
      }
    }

    // Analytics enrich to 6 lessons
    const an = db.prepare("SELECT id FROM courses WHERE title LIKE 'Вводный курс: Аналитика данных%' LIMIT 1").get() as any
    if (an) {
      const count = (db.prepare('SELECT COUNT(1) as c FROM lessons WHERE course_id = ?').get(an.id) as any).c as number
      if (count < 6) {
        const insertLesson = db.prepare('INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)')
        const updateLesson = db.prepare('UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?')
        const startPos = count + 1
        const l4 = [
          { type: 'theory', title: 'Базовая статистика', text: 'Среднее, медиана, мода, стандартное отклонение. Что использовать в отчётах.' },
          { type: 'quiz_mcq', title: 'Среднее vs медиана', question: 'Когда медиана лучше среднего?', options: ['Всегда', 'При выбросах/асимметрии распределения', 'Никогда'], correctIndex: 1 },
        ]
        const l5 = [
          { type: 'theory', title: 'Визуализация', text: 'Подбирайте график под задачу: линия — динамика, столбцы — сравнение, теплокарта — интенсивность.' },
          { type: 'code_task', title: 'Скетч дашборда', prompt: 'Опишите 3 графика для страницы “Оплаты” и зачем они нужны', starter: '', checkRegex: '.{60,}', tips: ['Укажите метрику, оси, период, фильтры'] },
        ]
        const l6 = [
          { type: 'theory', title: 'Мини‑проект', text: 'Сформулируйте KPI продукта и черновик SQL для ключевых метрик.' },
          { type: 'code_task', title: 'SQL‑скелет', prompt: 'Напишите скелет SQL для конверсии в оплату по дням', starter: 'WITH events AS (\n  SELECT user_id, name, ts\n  FROM raw_events\n)\nSELECT CAST(ts AS DATE) d, COUNT(CASE WHEN name = "purchase" THEN 1 END)*1.0/COUNT(CASE WHEN name = "signup" THEN 1 END) conv\nFROM events\nGROUP BY d;', checkRegex: 'SELECT', tips: ['Используйте агрегаты и CASE WHEN'] },
        ]
        const list = [
          { title: 'Базовая статистика для аналитика', duration_min: 35, blocks: l4 },
          { title: 'Визуализация: проектируем дашборд', duration_min: 40, blocks: l5 },
          { title: 'Мини‑проект: KPI и SQL‑скелет', duration_min: 60, blocks: l6 },
        ]
        list.forEach((l, i) => {
          const lid = rnd()
          insertLesson.run(lid, an.id, l.title, null, startPos + i)
          updateLesson.run(l.duration_min, null, JSON.stringify(l.blocks), lid)
        })
      }
    }

    // UX enrich to 6 lessons
    const ux = db.prepare("SELECT id FROM courses WHERE title LIKE 'Вводный курс: UX/UI дизайн%' LIMIT 1").get() as any
    if (ux) {
      const count = (db.prepare('SELECT COUNT(1) as c FROM lessons WHERE course_id = ?').get(ux.id) as any).c as number
      if (count < 6) {
        const insertLesson = db.prepare('INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)')
        const updateLesson = db.prepare('UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?')
        const startPos = count + 1
        const u4 = [
          { type: 'theory', title: 'Вайрфрейминг', text: 'Начинайте с низкой детализации, быстро проверяйте сценарии.' },
          { type: 'reflection', title: 'Эскиз', prompt: 'Опишите вайрфрейм экрана “Сброс пароля”: блоки, порядок, состояния' },
        ]
        const u5 = [
          { type: 'theory', title: 'UI‑кит и токены', text: 'Цвета, типографика, радиусы, отступы — основа дизайн‑системы.' },
          { type: 'code_task', title: 'Токены', prompt: 'Опишите 5 токенов (имя → значение → где примените)', starter: '', checkRegex: '.{50,}', tips: ['Пример: color.primary → #2563EB → кнопка CTA'] },
        ]
        const u6 = [
          { type: 'theory', title: 'Оценка решений', text: 'Юзабилити‑критерии: эффективность, понятность, удовлетворённость.' },
          { type: 'quiz_mcq', title: 'Антипаттерн', question: 'Что из этого — UX‑антипаттерн?', options: ['Ясная иерархия', 'Скрытый важный CTA', 'Согласованные состояния'], correctIndex: 1 },
        ]
        const list = [
          { title: 'Вайрфрейминг на практике', duration_min: 30, blocks: u4 },
          { title: 'UI‑кит и дизайн‑токены', duration_min: 35, blocks: u5 },
          { title: 'Оценка и улучшение UX', duration_min: 35, blocks: u6 },
        ]
        list.forEach((l, i) => {
          const lid = rnd()
          insertLesson.run(lid, ux.id, l.title, null, startPos + i)
          updateLesson.run(l.duration_min, null, JSON.stringify(l.blocks), lid)
        })
      }
    }
  } catch {}
}

function deepSeedAnalyticsIfNeeded() {
  try {
    const course = db.prepare("SELECT id, description FROM courses WHERE title LIKE 'Вводный курс: Аналитика данных%' LIMIT 1").get() as any
    if (!course) return
    const versionsCount = (db.prepare('SELECT COUNT(1) as c FROM lesson_versions lv JOIN lessons l ON l.id = lv.lesson_id WHERE l.course_id = ?').get(course.id) as any).c as number
    const lessonsCount = (db.prepare('SELECT COUNT(1) as c FROM lessons WHERE course_id = ?').get(course.id) as any).c as number
    // Only seed if not manually edited (no versions) and course looks like initial one or has < 6 lessons
    if (versionsCount > 0) return
    if (lessonsCount >= 6 && !String(course.description || '').includes('продолжать ли обучение')) return

    db.prepare('DELETE FROM lessons WHERE course_id = ?').run(course.id)
    const insertLesson = db.prepare('INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)')
    const updateLesson = db.prepare('UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?')
    const rnd = () => Math.random().toString(36).slice(2, 12)

    const long = (...paras: string[]) => paras.join('\n\n')

    const lessons = [
      {
        title: 'Роль аналитика и жизненный цикл данных',
        duration_min: 45,
        md: long(
          'Аналитик превращает данные в решения. В центре — постановка вопросов, корректный сбор, проверка, интерпретация и донесение выводов.',
          'Жизненный цикл: событие → сбор → хранение → подготовка → анализ → визуализация → принятие решения.',
          'Ключевые компетенции: SQL, статистика, продуктовые метрики, визуализация, формулирование гипотез.',
          'Источник правды: договоритесь о едином слое данных и определениях (словарь метрик).',
          'Ошибки: смещения выборки, невалидные события, смешение причинно‑следственных связей.',
          'Контекст: без понимания продукта выводы малоценны — работайте с командой.',
          'Риск‑менеджмент: отслеживайте качество данных, дропы событий и лаги обновления.',
          'Скорость vs точность: итерационный подход и правильный уровень точности.',
          'Документирование: репорты, дашборды, PTD (Problem‑Task‑Data) для задач.',
          'Коммуникации: формулируйте выводы в терминах влияния на продукт и пользователей.',
          'Этика данных: приватность, согласие, хранение и минимизация.',
          'Стейкхолдеры: договоритесь о SLA по отчетам и экспериментах.',
          'Платформа: определите стандарты событий и типов сущностей.',
          'Архитектура: сырые события, витрины, слоящиеся модели.',
          'Рост: автоматизация, метрики качества, менторство.'
        ),
        blocks: [
          { type: 'quiz_mcq', title: 'Что не относится к задаче аналитика?', question: 'Выберите вариант', options: ['Статистика и SQL', 'Разработка UI‑компонентов', 'Формулировка гипотез'], correctIndex: 1 },
          { type: 'reflection', title: 'Ваш контекст', prompt: 'Какие решения в продукте чаще всего требуют данных? Как вы бы их обслужили?' }
        ]
      },
      {
        title: 'SQL основы: SELECT, WHERE, GROUP BY, HAVING',
        duration_min: 55,
        md: long(
          'SELECT — извлечение, WHERE — фильтрация, GROUP BY — агрегация по группам.',
          'HAVING фильтрует агрегаты, ORDER BY сортирует, LIMIT ограничивает.',
          'Осторожно с NULL — агрегаты и условия ведут себя по‑разному.',
          'Типовые ошибки: забытый GROUP BY, дубли строк через неявные связи.',
          'Схема — всегда проверяйте названия и типы полей.',
          'Паттерны: топ‑N, ранжирование, конверсия по периодам.',
          'Практика — пишите запросы маленькими блоками и проверяйте промежуточные результаты.',
          'Стандарты — именование алиасов, читаемые отступы и комментарии.',
          'Тесты запросов — заложите sanity‑checks в dev‑среде.',
          'Оптимизация — индексы и предикаты, но сначала корректность.',
          'Частые оконные сценарии можно решить и без оконных, но они удобнее.',
          'CASE WHEN — друг для вычисляемых метрик.',
          'Календарные таблицы помогают при отсутствующих датах.',
          'Внимание к часовым поясам и локалям.',
          'Итерации — маленькими шагами.'
        ),
        blocks: [
          { type: 'sql', title: 'База данных магазина', schema: 'CREATE TABLE orders(id INT, user_id INT, amount REAL, created DATE); INSERT INTO orders VALUES (1,1,10,"2024-01-01"),(2,1,30,"2024-01-02"),(3,2,20,"2024-01-02");', task: 'Выведите все заказы', starter: 'SELECT * FROM orders;', tests: ['SELECT', 'FROM\s+orders'] },
          { type: 'sql', title: 'Сумма выручки', schema: 'CREATE TABLE orders(id INT, user_id INT, amount REAL, created DATE); INSERT INTO orders VALUES (1,1,10,"2024-01-01"),(2,1,30,"2024-01-02"),(3,2,20,"2024-01-02");', task: 'Подсчитайте суммарную выручку', starter: 'SELECT SUM(amount) AS revenue FROM orders;', tests: ['SUM\(\s*amount\s*\)'] },
          { type: 'sql', title: 'Выручка по пользователям', schema: 'CREATE TABLE orders(id INT, user_id INT, amount REAL); INSERT INTO orders VALUES (1,1,10),(2,1,30),(3,2,20);', task: 'Выведите выручку по каждому пользователю', starter: 'SELECT user_id, SUM(amount) revenue FROM orders GROUP BY user_id;', tests: ['GROUP\s+BY'] },
          { type: 'sql', title: 'Фильтр по порогу', schema: 'CREATE TABLE orders(id INT, user_id INT, amount REAL); INSERT INTO orders VALUES (1,1,10),(2,1,30),(3,2,20);', task: 'Только пользователи с выручкой >= 30', starter: 'SELECT user_id, SUM(amount) revenue FROM orders GROUP BY user_id HAVING SUM(amount) >= 30;', tests: ['HAVING'] },
          { type: 'sql', title: 'Ежедневная выручка', schema: 'CREATE TABLE orders(id INT, user_id INT, amount REAL, created DATE); INSERT INTO orders VALUES (1,1,10,"2024-01-01"),(2,1,30,"2024-01-02"),(3,2,20,"2024-01-02");', task: 'Выручка по дням', starter: 'SELECT created, SUM(amount) revenue FROM orders GROUP BY created ORDER BY created;', tests: ['ORDER\s+BY'] },
          { type: 'quiz_mcq', title: 'Вопрос', question: 'Где фильтровать агрегаты?', options: ['WHERE', 'HAVING'], correctIndex: 1 },
        ]
      },
      {
        title: 'JOIN и оконные функции',
        duration_min: 55,
        md: long(
          'JOIN связывает таблицы. Типы: INNER, LEFT, RIGHT, FULL.',
          'Ключ — корректный предикат соединения и понимание кратности.',
          'Оконные функции вычисляют агрегаты по окнам без схлопывания строк.',
          'Примеры: ROW_NUMBER, LAG/LEAD, SUM() OVER(PARTITION BY ... ORDER BY ...).',
          'Использование для retention, кумулятивов, ранжирования.',
          'Популярные ловушки: дубли из‑за JOIN, некорректные PARTITION.',
          'Производительность: фильтруйте как можно раньше.',
          'Тестируйте на небольших выборках и проверяйте руками.',
          'Логирование промежуточных результатов помогает.',
          'Согласуйте схемы идентификаторов.',
          'Документируйте поля/таблицы.',
          'Стабильные сортировки и NULLS FIRST/LAST при необходимости.',
          'Проверяйте дубликаты ключей.',
          'Визуализируйте связи.',
          'Смысл важнее синтаксиса.'
        ),
        blocks: [
          { type: 'sql', title: 'JOIN пользователей и заказов', schema: 'CREATE TABLE users(id INT, name TEXT); CREATE TABLE orders(id INT, user_id INT, amount REAL); INSERT INTO users VALUES (1,"Ann"),(2,"Bob"); INSERT INTO orders VALUES (1,1,10),(2,1,30),(3,2,20);', task: 'Имя и сумма выручки по пользователям', starter: 'SELECT u.name, SUM(o.amount) revenue FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.name;', tests: ['JOIN'] },
          { type: 'sql', title: 'ROW_NUMBER', schema: 'CREATE TABLE t(id INT, grp TEXT, val INT); INSERT INTO t VALUES (1,"A",10),(2,"A",20),(3,"B",5),(4,"B",15);', task: 'Пронумеруйте строки внутри группы', starter: 'SELECT id, grp, val, ROW_NUMBER() OVER(PARTITION BY grp ORDER BY val DESC) rn FROM t;', tests: ['ROW_NUMBER', 'OVER'] },
          { type: 'sql', title: 'Кумулятив', schema: 'CREATE TABLE s(d DATE, amount INT); INSERT INTO s VALUES ("2024-01-01", 10),("2024-01-02", 5),("2024-01-03", 7);', task: 'Кумулятивная выручка', starter: 'SELECT d, SUM(amount) OVER(ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) cum FROM s;', tests: ['SUM\(.*OVER'] },
          { type: 'quiz_mcq', title: 'JOIN типы', question: 'Какой JOIN вернёт все строки левой таблицы?', options: ['INNER', 'LEFT'], correctIndex: 1 },
        ]
      },
      {
        title: 'Метрики продукта и когортный анализ',
        duration_min: 50,
        md: long(
          'Метрики: активация, конверсия, удержание, LTV, ARPU.',
          'Когортный анализ показывает поведение наборов пользователей во времени.',
          'Определения — фиксируйте событие старта когорты и окна измерения.',
          'Ретеншен: доля вернувшихся в N‑й день/неделю/месяц.',
          'Лестницы конверсии — воронки действий.',
          'Нормализация по активной базе.',
          'Визуализация в теплокартах помогает увидеть тренды.',
          'Сезонность и аномалии — контекст важен.',
          'Реинжиниринг метрик при смене модели данных.',
          'Семплирование аккуратно.',
          'Оценка влияния: привязка к бизнес‑целям.',
          'Единицы измерения согласовать заранее.',
          'Сегментация: платящие vs неплатящие, каналы, регионы.',
          'Воронки и retargeting.',
          'Гипотезы и приоритизация.'
        ),
        blocks: [
          { type: 'sql', title: 'Когорта по месяцу регистрации', schema: 'CREATE TABLE users(id INT, signup DATE); CREATE TABLE events(user_id INT, name TEXT, ts DATE); INSERT INTO users VALUES (1,"2024-01-01"),(2,"2024-01-15"),(3,"2024-02-01"); INSERT INTO events VALUES (1,"open","2024-02-01"),(2,"open","2024-02-20"),(3,"open","2024-03-05");', task: 'Определите месяц когорты по signup', starter: 'SELECT id, strftime("%Y-%m", signup) cohort FROM users;', tests: ['strftime'] },
          { type: 'sql', title: 'Ретеншен 30‑го дня', schema: 'CREATE TABLE users(id INT, signup DATE); CREATE TABLE events(user_id INT, name TEXT, ts DATE); INSERT INTO users VALUES (1,"2024-01-01"),(2,"2024-01-15"); INSERT INTO events VALUES (1,"open","2024-01-31"),(2,"open","2024-02-20");', task: 'Флаг возврата в 30‑й день', starter: 'SELECT u.id, CASE WHEN EXISTS(SELECT 1 FROM events e WHERE e.user_id=u.id AND julianday(e.ts)-julianday(u.signup) BETWEEN 29 AND 31) THEN 1 ELSE 0 END as d30 FROM users u;', tests: ['EXISTS'] },
          { type: 'code_task', title: 'Метрики', prompt: 'Опишите ключевые метрики вашего продукта и почему именно они отражают ценность', starter: '', checkRegex: '.{120,}' },
        ]
      },
      {
        title: 'Эксперименты и A/B‑тестирование',
        duration_min: 50,
        md: long(
          'A/B‑тест — сравнение вариантов с рандомизацией и контролем.',
          'Ключ: дизайн эксперимента, размер выборки, метрики успеха.',
          'Слои и стратификация уменьшают дисперсию.',
          'Период охлаждения и окна анализа — чтобы исключить перекрестные эффекты.',
          'Мультивариантность и ошибки I/II рода.',
          'Остановки по правилам, а не по пикам.',
          'Интерпретация: значимость и эффект‑сайз.',
          'Практика отчётности и принятия решений.',
          'Этика и влияние на пользователей.',
          'Репликация и пост‑анализ.',
          'Логи: отслеживайте экспериментальные флаги.',
          'Дизайн показов и длительность.',
          'Согласование с командой.',
          'Шаблоны отчётов.',
          'Чек‑лист запуска.'
        ),
        blocks: [
          { type: 'quiz_mcq', title: 'Ошибка', question: 'Что такое ошибка I рода?', options: ['Ложно положительное', 'Ложно отрицательное'], correctIndex: 0 },
          { type: 'code_task', title: 'Дизайн эксперимента', prompt: 'Опишите дизайн A/B‑теста для платежного экрана: рандомизация, метрики, ожидаемый эффект, длительность', starter: '', checkRegex: '.{160,}' },
        ]
      },
      {
        title: 'Итоговый мини‑проект',
        duration_min: 60,
        md: long(
          'Соберите дашборд по ключевым KPI и подготовьте SQL‑запросы витрин.',
          'Опишите методику расчёта метрик и проверок качества.',
          'Подготовьте одностраничный отчёт о состоянии продукта.',
          'Презентация результатов команде.',
          'Риски и ограничения анализа.',
          'План последующих улучшений.',
          'Согласование с бизнесом.',
          'Формат хранения отчётов.',
          'Шаблоны автоматизации обновлений.',
          'Требования к данным.',
          'План мониторинга.',
          'Процедуры инцидентов.',
          'Метрики стабильности.',
          'План развития аналитической платформы.',
          'Ретроспектива.'
        ),
        blocks: [
          { type: 'sql', title: 'SQL‑скелет конверсии', schema: 'CREATE TABLE events(user_id INT, name TEXT, ts DATE);', task: 'Скелет конверсии signup→purchase по дням', starter: 'WITH e AS (SELECT * FROM events) SELECT DATE(ts) d, SUM(CASE WHEN name="purchase" THEN 1 END)*1.0/NULLIF(SUM(CASE WHEN name="signup" THEN 1 END),0) conv FROM e GROUP BY d;', tests: ['WITH', 'GROUP\s+BY'] },
          { type: 'reflection', title: 'Отчёт', prompt: 'Кратко опишите результаты мини‑проекта и дальнейшие шаги' },
        ]
      },
    ]

    lessons.forEach((l, i) => {
      const id = rnd()
      insertLesson.run(id, course.id, l.title, null, i + 1)
      updateLesson.run(l.duration_min, l.md, JSON.stringify(l.blocks), id)
    })
  } catch {}
}

function deepSeedUxIfNeeded() {
  try {
    const course = db.prepare("SELECT id, description FROM courses WHERE title LIKE 'Вводный курс: UX/UI дизайн%' LIMIT 1").get() as any
    if (!course) return
    const versionsCount = (db.prepare('SELECT COUNT(1) as c FROM lesson_versions lv JOIN lessons l ON l.id = lv.lesson_id WHERE l.course_id = ?').get(course.id) as any).c as number
    const lessonsCount = (db.prepare('SELECT COUNT(1) as c FROM lessons WHERE course_id = ?').get(course.id) as any).c as number
    if (versionsCount > 0) return
    if (lessonsCount >= 6 && !String(course.description || '').includes('мое/не мое')) return

    db.prepare('DELETE FROM lessons WHERE course_id = ?').run(course.id)
    const insertLesson = db.prepare('INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)')
    const updateLesson = db.prepare('UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?')
    const rnd = () => Math.random().toString(36).slice(2, 12)
    const long = (...paras: string[]) => paras.join('\n\n')

    const lessons = [
      {
        title: 'Роль продуктового дизайнера и процесс',
        duration_min: 45,
        md: long(
          'Дизайнер решает задачи пользователей и бизнеса. Работа включает исследование, проектирование, валидацию и поставку.',
          'Фреймворки: Double Diamond, Lean UX, JTBD. Поиск проблемы, фокусировка, генерация решений, проверка.',
          'Командная работа: продукт, аналитика, разработка. Коммуникация — ключ.',
          'Инструменты: Figma, Miro, прототипирование, дизайн‑системы.',
          'Доставка ценности — ориентир для решений.',
          'Метрики UX: эффективность, понятность, удовлетворенность.',
          'Доступность — часть качества.',
          'Версионирование и контроль изменений.',
          'Принятие решений на данных и исследованиях.',
          'Презентация работ и сбор фидбэка.',
          'Ретроспектива и итерации.',
          'Документирование артефактов.',
          'Этика дизайна.',
          'Фокус на проблеме, а не на решении.',
          'Рост: менторство, библиотека паттернов.'
        ),
        blocks: [
          { type: 'quiz_mcq', title: 'Ключ процесса', question: 'Что указывает на успех UX‑изменения?', options: ['Красивые пиксели', 'Метрики поведения и бизнес‑эффект'], correctIndex: 1 },
          { type: 'reflection', title: 'Контекст', prompt: 'Какие UX‑проблемы видите в вашем продукте и как бы проверили гипотезы?' }
        ]
      },
      {
        title: 'Исследование: интервью, персоны, сценарии',
        duration_min: 50,
        md: long(
          'Исследования выявляют потребности и препятствия. Интервью — инструмент понимания контекста.',
          'Персоны фиксируют ключевые сегменты и цели.',
          'Сценарии — путь пользователя к цели.',
          'Рекрутинг и план вопросов.',
          'Синтез инсайтов — affinity‑диаграммы.',
          'Артефакты — CJM, персоны, сценарии.',
          'Риски смещения — планируйте нейтрализацию.',
          'Этические аспекты.',
          'Валидация находок.',
          'Коммуникация результатов команде.',
          'Постоянство исследований — система, а не разовая активность.',
          'Актуализация персон.',
          'Приоритизация задач.',
          'Интеграция с продуктовыми метриками.',
          'Эксперименты для проверки решений.'
        ),
        blocks: [
          { type: 'code_task', title: 'Гайд интервью', prompt: 'Составьте 8–10 вопросов для интервью по проблеме онбординга', starter: '', checkRegex: '.{200,}' },
          { type: 'quiz_mcq', title: 'Персоны', question: 'Что НЕ относится к персоне?', options: ['Цели', 'Любимый цвет без связи с задачей'], correctIndex: 1 },
        ]
      },
      {
        title: 'Информационная архитектура и пользовательские потоки',
        duration_min: 50,
        md: long(
          'IA — структура контента и навигации. Потоки — шаги к целям.',
          'Карты сайтов, группы контента, метки.',
          'Принципы findability, learnability.',
          'Баланс глубины/ширины.',
          'Ошибки: избыточная вложенность, непонятные названия.',
          'Метрики IA: время до задачи, ошибки маршрутизации.',
          'Тесты навигации (tree test).',
          'Иерархия и контекст.',
          'Микроскопические решения.',
          'Согласованность паттернов.',
          'Переиспользуемость.',
          'Маппинг задач на пути.',
          'Альтернативные маршруты.',
          'Состояния ошибок.',
          'Обратная связь.'
        ),
        blocks: [
          { type: 'code_task', title: 'Карта сайта', prompt: 'Опишите карту сайта на 3 уровня для сервиса подписок', starter: '', checkRegex: '.{150,}' },
          { type: 'quiz_mcq', title: 'Findability', question: 'Что повышает находимость?', options: ['Случайные названия', 'Ясные метки и иерархия'], correctIndex: 1 },
        ]
      },
      {
        title: 'Вайрфрейминг и макеты',
        duration_min: 55,
        md: long(
          'Вайрфреймы — быстрые схемы интерфейса для обсуждения и проверки.',
          'Сетка, отступы, визуальная иерархия.',
          'Состояния, пустые экраны и ошибки.',
          'Адаптивность: mobile‑first.',
          'Паттерны списков/карточек/форм.',
          'Сценарии кликов и переходов.',
          'Подписи и микрокопия.',
          'Логика фокуса/клавиатуры.',
          'Параллельные сценарии.',
          'Варианты и сравнение.',
          'Проверка реалистичных данных.',
          'Учёт крайних случаев.',
          'Подготовка к юзтестам.',
          'Коммуникация с разработкой.',
          'Прототипы.'
        ),
        blocks: [
          { type: 'code_runner', title: 'Скелет формы', initialHtml: '<form id="f"><label>Имя<input></label><button id="b">Отправить</button></form>', initialCss: 'form{display:flex;flex-direction:column;gap:8px}label{display:flex;flex-direction:column}', initialJs: '', testScript: 'window.__OK=!!document.querySelector("#f")' },
          { type: 'code_task', title: 'Сценарии', prompt: 'Опишите 3 сценария с ошибками/крайними случаями для формы регистрации', starter: '', checkRegex: '.{150,}' },
        ]
      },
      {
        title: 'Визуальный дизайн и токены',
        duration_min: 50,
        md: long(
          'Токены — дизайн на уровне переменных: цвета, типографика, отступы.',
          'Согласованность — основа масштабируемости.',
          'Контраст и доступность.',
          'Сетки и ритм.',
          'Компоненты и варианты.',
          'Тёмная тема — инверсия и контраст.',
          'Состояния компонентов.',
          'Анимации и живость.',
          'Согласование с бренд‑гайдом.',
          'Проверка на разных устройствах.',
          'Многоязычие.',
          'Модульность.',
          'Гибкость.',
          'Тестирование.',
          'Документация.'
        ),
        blocks: [
          { type: 'code_task', title: 'Токены', prompt: 'Опишите 8–10 токенов (имя → значение → где примените)', starter: '', checkRegex: '.{160,}' },
          { type: 'code_runner', title: 'Кнопки', initialHtml: '<button class="btn primary">Продолжить</button> <button class="btn secondary">Отмена</button>', initialCss: '.btn{padding:.5rem 1rem;border-radius:.5rem;border:1px solid #e5e7eb}.primary{background:#111;color:#fff}.secondary{background:#fff;color:#111}', initialJs: '', testScript: 'window.__OK=!!document.querySelector(".btn.primary")' },
        ]
      },
      {
        title: 'Хэнд‑офф и оценка UX',
        duration_min: 50,
        md: long(
          'Хэнд‑офф — передача спецификаций и логики интерфейса разработке.',
          'Оценка качества: юзабилити‑критерии и метрики.',
          'Приёмочные критерии и сценарии e2e.',
          'Дефекты и процессы фиксов.',
          'Совместные сессии и демо.',
          'Договоритесь о SLA и форматах.',
          'Мониторинг UX‑регрессий.',
          'Обратная связь от поддержки.',
          'Непрерывные улучшения.',
          'Планирование релизов.',
          'Прозрачность и ответственность.',
          'Риски и их снижение.',
          'Инклюзивность.',
          'Конфиденциальность.',
          'Ретроспектива.'
        ),
        blocks: [
          { type: 'code_task', title: 'Acceptance', prompt: 'Опишите приёмочные критерии для сценария “Сброс пароля”', starter: '', checkRegex: '.{150,}' },
          { type: 'quiz_mcq', title: 'Регрессии', question: 'Что помогает ловить UX‑регресс?', options: ['Случайность', 'Регрессионные сценарии и мониторинг'], correctIndex: 1 },
        ]
      },
    ]

    lessons.forEach((l, i) => {
      const id = rnd()
      insertLesson.run(id, course.id, l.title, null, i + 1)
      updateLesson.run(l.duration_min, l.md, JSON.stringify(l.blocks), id)
    })
  } catch {}
}

function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(*) as c FROM courses').get() as any
  if (row.c > 0) return

  const insertCourse = db.prepare(
    'INSERT INTO courses (id, title, description, price_cents, expert_name) VALUES (?, ?, ?, ?, ?)'
  )
  const insertLesson = db.prepare(
    'INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)'
  )

  const randomId = () => Math.random().toString(36).slice(2, 12)
  // Реальные направления и курсы с конкретными модулями
  const seedData = [
    {
      title: 'Frontend React разработчик: с нуля до первых задач',
      expert_name: 'Алексей Шабалин (ex‑Yandex)',
      price_cents: 34900,
      description:
        'Современный React 19, Next.js 15, TypeScript, тесты и CI. Итог — pet‑project уровня junior.',
      lessons: [
        {
          title: 'JS/TS основы, сборка и дебаг',
          video_url: 'https://www.youtube.com/watch?v=DHjqpvDN6nQ',
          duration_min: 90,
          content_md: `## Цели
К концу урока вы:
- Поймёте основы JS (типизация, функции, объекты, массивы)
- Освоите базовый TypeScript (типы, интерфейсы, generics)
- Настроите сборку проекта и дебаг в браузере

## План
1. Быстрый JS-ритейк: значения, область видимости, модули
2. Введение в TS: типы, интерфейсы, типизация функций
3. Инструменты: Node.js, npm, Vite/Next, DevTools

## Практика
Создайте проект и реализуйте функцию в TS:

\`\`\`ts
type User = { id: string; email: string; isActive: boolean }
export function filterActive(users: User[]): User[] {
  return users.filter((u) => u.isActive)
}
\`\`\`

## Домашка
- Подключить ESLint + Prettier
- Написать 3 функции с корректными типами

## Материалы
- TypeScript handbook
- Chrome DevTools overview
`
        },
        {
          title: 'React 19: компоненты, стейт, эффекты',
          video_url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
          duration_min: 100,
          content_md: `## Цели
- Понять ментальную модель React
- Научиться работать со стейтом и эффектами

## План
1. Компоненты и пропсы, композиция
2. useState/useEffect: паттерны, антипаттерны
3. Управление формами

## Практика
Сделайте компонент \`TodoList\` с добавлением/удалением задач и сохранением в localStorage.

## Домашка
- Выполнить TodoList с фильтрами: все/выполненные/активные
`
        },
        {
          title: 'Next.js 15: app router, серверные actions',
          video_url: 'https://www.youtube.com/watch?v=__mSgDEOyv8',
          duration_min: 110,
          content_md: `## Цели
- Освоить файловый роутинг \`app\`
- Понять серверные/клиентские компоненты, actions

## План
1. Структура папок: \`app\`,\`layout\`,\`page\`
2. Серверные actions и формы
3. Загрузка данных, кеширование

## Практика
Сделайте страницу \`/notes\` с CRUD через server actions (SQLite).
`
        },
        {
          title: 'Дизайн-система и Tailwind CSS 4',
          video_url: 'https://www.youtube.com/watch?v=mr15Xzb1Ook',
          duration_min: 80,
          content_md: `## Цели
- Научиться проектировать UI-кит
- Освоить Tailwind 4, токены дизайна

## Практика
Соберите библиотеку кнопок: primary/secondary/ghost с состояниями.
`
        },
        {
          title: 'Тестирование (Jest, React Testing Library)',
          video_url: 'https://www.youtube.com/watch?v=r9HdJ8P6GQI',
          duration_min: 90,
          content_md: `## Цели
- Писать юнит/компонентные тесты

## Практика
Протестируйте \`TodoList\` (добавление, удаление, фильтры).
`
        },
        {
          title: 'Проект: деплой и карьерный пакет',
          video_url: 'https://www.youtube.com/watch?v=ZVOGPvo08zM',
          duration_min: 120,
          content_md: `## Цели
- Подготовить pet‑project, задеплоить, оформить резюме

## Практика
- Деплой на Vercel
- README с демо, скриншотами, стеком
`
        },
      ],
    },
    {
      title: 'Аналитик данных: SQL, Python, дашборды',
      expert_name: 'Анна Смирнова (ex‑OZON)',
      price_cents: 39900,
      description:
        'SQL для аналитиков, Pandas и визуализация, A/B и продуктовые метрики. Итог — аналитический кейс.',
      lessons: [
        { title: 'SQL: JOIN, агрегаты, оконные', video_url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', duration_min: 100, content_md: '## План\n- JOINы, GROUP BY, оконные\n\n## Практика\n- Выгрузить топ-товары по выручке по категориям' },
        { title: 'Python и Pandas: EDA', video_url: 'https://www.youtube.com/watch?v=vmEHCJofslg', duration_min: 90, content_md: '## EDA\n- Чистка, feature engineering\n\n## Практика\n- Jupyter-ноутбук c анализом churn' },
        { title: 'Визуализация: matplotlib/plotly', video_url: 'https://www.youtube.com/watch?v=3Xc3CA655Y4', duration_min: 80, content_md: '## Графики\n- Line/Bar/Heatmap\n\n## Практика\n- Дашборд Retention' },
        { title: 'Метрики продукта и когортный анализ', video_url: 'https://www.youtube.com/watch?v=w2i-Ub2GZug', duration_min: 80, content_md: '## Метрики\n- DAU/WAU/MAU, LTV, CAC\n\n## Практика\n- Когортный анализ по месяцу регистрации' },
        { title: 'A/B тесты: дизайн и интерпретация', video_url: 'https://www.youtube.com/watch?v=HPOhr31n2Pg', duration_min: 70, content_md: '## A/B\n- Размер выборки, t‑test\n\n## Практика\n- Разбор эксперимента по конверсии' },
        { title: 'Кейс: аналитический отчет и питч', video_url: 'https://www.youtube.com/watch?v=PuG7e2KxMgo', duration_min: 120, content_md: '## Кейс\n- Презентация находок\n\n## Практика\n- Слайды + питч 3 минуты' },
      ],
    },
    {
      title: 'UX/UI дизайн: практика Figma и прототипирование',
      expert_name: 'Дмитрий Орлов (Senior Product Designer)',
      price_cents: 32900,
      description:
        'UX‑исследование, прототипы в Figma, компоненты и хэнд‑офф разработчикам. Итог — UI‑кит и кейс в портфолио.',
      lessons: [
        { title: 'UX фундамент и CJM', video_url: 'https://www.youtube.com/watch?v=Ovj4hFxko7c', duration_min: 80, content_md: '## UX основы\n- CJM, JTBD\n\n## Практика\n- Карта пути пользователя' },
        { title: 'Figma: автолэйаут, компоненты, варианты', video_url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', duration_min: 90, content_md: '## Figma\n- Компоненты и варианты\n\n## Практика\n- UI‑кит кнопок' },
        { title: 'Дизайн-система и типографика', video_url: 'https://www.youtube.com/watch?v=u6UXm6r1L9U', duration_min: 70, content_md: '## Типографика\n- Скейлы, сетка\n\n## Практика\n- Текстовые стили' },
        { title: 'Прототипы и пользовательские сценарии', video_url: 'https://www.youtube.com/watch?v=R8tX1c9WftM', duration_min: 80, content_md: '## Прототип\n- Сценарии и связи\n\n## Практика\n- Кликабельный прототип' },
        { title: 'Хэнд‑офф: спецификации и экспорт', video_url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', duration_min: 60, content_md: '## Хэнд‑офф\n- Спеки и экспорт\n\n## Практика\n- Передача макета' },
        { title: 'Портфолио и презентация кейса', video_url: 'https://www.youtube.com/watch?v=2LhoCfjm8R4', duration_min: 100, content_md: '## Портфолио\n- Структура и сторителлинг\n\n## Практика\n- Оформление кейса' },
      ],
    },
  ] as const

  for (const s of seedData) {
    const id = randomId()
    insertCourse.run(id, s.title, s.description, s.price_cents, s.expert_name)
    s.lessons.forEach((l, idx) => {
      insertLesson.run(randomId(), id, l.title, l.video_url, idx + 1,)
      // Update new columns if they exist
      db.prepare('UPDATE lessons SET duration_min = ?, content_md = ? WHERE course_id = ? AND title = ?').run(
        (l as any).duration_min ?? 0,
        (l as any).content_md ?? null,
        id,
        l.title,
      )
    })
  }
}

console.log('Seeding database...');
try {
  const metaSeeded = db.prepare('SELECT value FROM meta WHERE key = ?').get('seeded_v2') as any;
  if (!metaSeeded?.value) {
    // 1) seed base courses first (old simple ones)
    try { seedIfEmpty() } catch (e) { console.error('Error in seedIfEmpty:', e); }
    // 2) then convert/replace with intro + deep interactive content
    try { upgradeIntroFrontendIfNeeded() } catch (e) { console.error('Error in upgradeIntroFrontendIfNeeded:', e); }
    try { upgradeIntroAnalyticsIfNeeded() } catch (e) { console.error('Error in upgradeIntroAnalyticsIfNeeded:', e); }
    try { upgradeIntroUxIfNeeded() } catch (e) { console.error('Error in upgradeIntroUxIfNeeded:', e); }
    try { deepSeedAnalyticsIfNeeded() } catch (e) { console.error('Error in deepSeedAnalyticsIfNeeded:', e); }
    try { deepSeedUxIfNeeded() } catch (e) { console.error('Error in deepSeedUxIfNeeded:', e); }
    // 3) enrich to add more lessons if needed
    try { enrichCoursesIfNeeded() } catch (e) { console.error('Error in enrichCoursesIfNeeded:', e); }
    db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('seeded_v2', new Date().toISOString());
    console.log('Database seeded.');
  } else {
    console.log('Database already seeded.');
  }
} catch (e) {
  console.error('Error seeding database:', e);
} finally {
  db.close();
}
