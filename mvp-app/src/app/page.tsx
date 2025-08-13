import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <section className="mx-auto max-w-6xl py-10">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
            🚀 Запусти новую карьеру
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
            Учись быстро. Стартуй карьеру уверенно.
          </h1>
          <p className="text-lg text-gray-700">
            CareerFirst — платформа, которая помогает прокачать навыки и выйти на оффер.
            Курсы, проекты, менторство и карьерный трек — всё в одном месте.
          </p>
          <div className="flex gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                К дашборду
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Начать бесплатно
                </Link>
                <Link
                  href="#features"
                  className="rounded-md bg-white px-5 py-3 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Узнать больше
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <video className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-black shadow-xl ring-1 ring-gray-100" autoPlay muted playsInline loop>
            <source src="https://cdn.coverr.co/videos/coverr-web-design-6929/1080p.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <div id="features" className="mt-20 grid gap-6 sm:grid-cols-2">
        {[
          {
            title: 'Живые проекты',
            desc: 'Практика на реальных задачах и портфолио, за которое не стыдно.',
          },
          { title: 'Менторы', desc: 'Поддержка экспертов из индустрии на каждом шаге.' },
          {
            title: 'Карьерный трек',
            desc: 'Резюме, LinkedIn, собеседования — всё под контролем.',
          },
          { title: 'Комьюнити', desc: 'Единомышленники и новые возможности каждый день.' },
        ].map((f) => (
          <div key={f.title} className="group rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


