export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white/70 py-8 text-sm text-gray-600">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} CareerFirst</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-900">Политика</a>
            <a href="#" className="hover:text-gray-900">Условия</a>
            <a href="#" className="hover:text-gray-900">Контакты</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


