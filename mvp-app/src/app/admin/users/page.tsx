import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const users = db.prepare('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC').all() as any[]

  async function updateUser(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    const role = formData.get('role') as string

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId)
    redirect('/admin/users')
  }

  async function forcePasswordReset(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    db.prepare('UPDATE users SET must_change_password = 1 WHERE id = ?').run(userId)
    redirect('/admin/users')
  }

  return (
    <section className="mx-auto max-w-6xl py-10">
      <h1 className="text-2xl font-semibold">Пользователи</h1>
      <ul className="mt-6 divide-y rounded-xl border bg-white shadow-sm">
        {users.map(u => (
          <li key={u.id} className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-3 gap-4">
            <div>
              <div className="font-medium">{u.email}</div>
              <div className="text-sm text-gray-500">Зарегистрирован: {new Date(u.created_at).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-4">
                <form action={updateUser} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="role" defaultValue={u.role} className="rounded-md border p-1.5 text-sm">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                    <button className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800">Сохранить роль</button>
                </form>
                 <form action={forcePasswordReset}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-800">Сбросить пароль</button>
                </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
