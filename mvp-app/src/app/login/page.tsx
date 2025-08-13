import { login, signup } from './actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const messageParam = sp?.message
  const message = Array.isArray(messageParam) ? messageParam[0] : messageParam
  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">Войти в CareerFirst</div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">С возвращением</h1>
          <p className="mt-1 text-sm text-gray-600">Войдите в аккаунт или создайте новый</p>
        </div>
        {message ? (
          <p className="rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800 ring-1 ring-indigo-200">{message}</p>
        ) : null}
        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm ring-1 ring-black/5 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm ring-1 ring-black/5 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              formAction={login}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Войти
            </button>
            <button
              formAction={signup}
              className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Создать аккаунт
            </button>
          </div>
          <p className="text-center text-sm text-gray-600">
            Нажимая кнопку, вы соглашаетесь с
            <Link href="#" className="ml-1 underline underline-offset-4">условиями сервиса</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
