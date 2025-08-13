import { getCurrentUser, hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function ChangePasswordPage() {
  const user = await getCurrentUser()
  if (!user) {
    return redirect('/login')
  }

  async function changePassword(formData: FormData) {
    'use server'
    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (newPassword !== confirmPassword) {
      return redirect('/auth/change-password?message=Пароли не совпадают')
    }
    if (newPassword.length < 8) {
        return redirect('/auth/change-password?message=Пароль должен быть не менее 8 символов')
    }

    const newPasswordHash = hashPassword(newPassword)
    db.prepare(
      'UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?'
    ).run(newPasswordHash, user.id)

    redirect('/dashboard?message=Пароль успешно изменен')
  }

  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <h1 className="text-2xl font-semibold">Смена пароля</h1>
        <p className="text-sm text-gray-600">
          В целях безопасности, вам необходимо сменить пароль.
        </p>
        <form action={changePassword} className="space-y-4">
          <input
            name="new_password"
            type="password"
            required
            placeholder="Новый пароль"
            className="w-full rounded-md border p-2"
          />
          <input
            name="confirm_password"
            type="password"
            required
            placeholder="Подтвердите новый пароль"
            className="w-full rounded-md border p-2"
          />
          <button className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white">
            Сменить пароль
          </button>
        </form>
      </div>
    </div>
  )
}
