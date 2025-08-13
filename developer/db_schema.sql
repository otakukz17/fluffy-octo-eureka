-- 1. Создание таблицы курсов
CREATE TABLE courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  expert_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Создание таблицы уроков
CREATE TABLE lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Создание таблицы для связи пользователей и курсов (зачисления)
CREATE TABLE enrollments (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

-- 4. Создание таблицы для отслеживания прогресса
CREATE TABLE progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- 5. Включение Row Level Security (RLS) для всех таблиц
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- 6. Создание политик RLS

-- Курсы являются публичными и могут быть просмотрены кем угодно.
CREATE POLICY "Allow public read access to courses"
ON courses
FOR SELECT
USING (true);

-- Пользователи могут видеть свои собственные зачисления.
CREATE POLICY "Allow individual read access to enrollments"
ON enrollments
FOR SELECT
USING (auth.uid() = user_id);

-- Пользователи могут видеть уроки для курсов, на которые они зачислены.
CREATE POLICY "Allow enrolled users to read lessons"
ON lessons
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM enrollments
    WHERE enrollments.course_id = lessons.course_id
      AND enrollments.user_id = auth.uid()
  )
);

-- Пользователи могут управлять своим собственным прогрессом.
CREATE POLICY "Allow individual access to progress"
ON progress
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ВАЖНО: Эта политика позволяет пользователям записываться на курсы.
-- В реальном приложении это должно управляться бэкендом после успешной оплаты.
-- Для MVP мы временно разрешаем это.
CREATE POLICY "Allow users to insert their own enrollments"
ON enrollments
FOR INSERT
WITH CHECK (auth.uid() = user_id);
