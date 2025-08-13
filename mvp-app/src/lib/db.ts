import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.join(process.cwd(), 'var')
const dbPath = path.join(dataDir, 'data.sqlite')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Reuse single connection in dev to avoid WAL lock/errors on HMR
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any
export const db: Database = g.__cf_db || new Database(dbPath, { fileMustExist: false })
if (!g.__cf_db) {
  g.__cf_db = db
  try {
    db.pragma('busy_timeout = 5000')
    db.pragma('journal_mode = WAL')
  } catch {
    try {
      db.pragma('journal_mode = DELETE')
    } catch {}
  }
}

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      email_verified_at TEXT,
      must_change_password INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT,
      description TEXT,
      cover_image TEXT,
      price_cents INTEGER NOT NULL DEFAULT 0,
      expert_name TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      tags_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      video_url TEXT,
      position INTEGER NOT NULL,
      duration_min INTEGER DEFAULT 0,
      content_md TEXT,
      content_json TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      author_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user_id, course_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_completions (
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed_at TEXT,
      PRIMARY KEY(user_id, lesson_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      data_json TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      score INTEGER,
      attempts INTEGER,
      time_spent_sec INTEGER,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user_id, lesson_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_versions (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      title TEXT,
      position INTEGER,
      duration_min INTEGER,
      content_md TEXT,
      content_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT,
      lesson_id TEXT,
      type TEXT NOT NULL,
      payload_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  try {
    // Legacy migration: if 'progress' table exists, rename it to 'lesson_completions'
    const res = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='progress'`).get();
    if (res) {
      // and if lesson_completions does not exist
      const res2 = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='lesson_completions'`).get();
      if (!res2) {
        db.exec('ALTER TABLE progress RENAME TO lesson_completions');
      }
    }
  } catch (e) {
    // Ignore errors if the table doesn't exist
  }

  const ensureColumn = (table: string, column: string, ddl: string) => {
    try {
      const info = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      const exists = info.some((c) => c.name === column);
      if (!exists) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
      }
    } catch (e) {
      // ignore if table does not exist
    }
  };

  ensureColumn('users', 'must_change_password', 'must_change_password INTEGER DEFAULT 0');
}

// This space is intentionally left blank.


