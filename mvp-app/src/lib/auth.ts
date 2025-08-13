import crypto from 'node:crypto'
import { cookies } from 'next/headers'
import { db } from './db'

const SESSION_COOKIE = 'cf_session'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as any
  if (!session) return null
  const user = db.prepare('SELECT id, email, role, created_at FROM users WHERE id = ?').get(session.user_id) as any
  return user ?? null
}

export function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function startSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex')
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId)
  const cookieStore = await cookies()
  cookieStore.set({ name: SESSION_COOKIE, value: token, httpOnly: true, path: '/', sameSite: 'lax' })
}

export async function endSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
    cookieStore.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 })
  }
}

export function createUser(email: string, password: string) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any
  const passwordHash = hashPassword(password)
  if (existing) {
    // Idempotent signup: update password to the latest and reuse account
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, existing.id)
    return { id: existing.id, email }
  }
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(id, email, passwordHash)
  return { id, email }
}

export function verifyUser(email: string, password: string) {
  const user = db.prepare('SELECT id, email, role, password_hash FROM users WHERE email = ?').get(email) as any
  if (!user) return null
  const inputHash = hashPassword(password)
  if (user.password_hash !== inputHash) return null
  return { id: user.id, email: user.email, role: user.role }
}


