import { Link, NavLink } from "react-router"

import { Menu, X } from "lucide-react"

import { useState } from "react"

import logoSaal from "../../imports/logo_fundo_0.png"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-[#E4B04A] after:transition-transform ${
      isActive
        ? "text-[#2E7D6B] after:scale-x-100"
        : "text-[#416f65] hover:text-[#2E7D6B] after:scale-x-0 hover:after:scale-x-100"
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-[#2E7D6B]/10 bg-white/95 shadow-[0_8px_30px_rgba(46,125,107,0.06)] backdrop-blur-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <img
              src={logoSaal}
              alt="SAAL - Santuário de Animais Anjos da Luz"
              className="h-12 w-12 shrink-0 object-contain transition-transform group-hover:scale-105 sm:h-14 sm:w-14 md:h-16 md:w-16"
            />
            <div className="hidden min-w-0 sm:block">
              <h1 className="text-lg font-bold leading-tight text-[#2E7D6B]">
                SAAL
              </h1>
              <p className="truncate text-xs text-[#6FAE9C]">
                Santuário de Animais Anjos da Luz
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navClass}>
              Início
            </NavLink>
            <NavLink to="/animais" className={navClass}>
              Animais
            </NavLink>
            <NavLink to="/contato" className={navClass}>
              Contato
            </NavLink>
            <Link
              to="/animais"
              className="bg-[#E4B04A] text-white px-6 py-2 rounded-full hover:bg-[#d4a03a] transition-all shadow-md hover:shadow-lg"
            >
              Quero Adotar
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-[#2E7D6B] md:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-primary-navigation"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav
            id="mobile-primary-navigation"
            aria-label="Navegação principal"
            className="md:hidden mt-4 flex flex-col gap-1 border-t border-[#2E7D6B]/10 pb-2 pt-4"
          >
            <Link
              to="/"
              className="flex min-h-11 items-center py-2 text-[#2E7D6B] transition-colors hover:text-[#E4B04A]"
              onClick={() => setMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/animais"
              className="flex min-h-11 items-center py-2 text-[#2E7D6B] transition-colors hover:text-[#E4B04A]"
              onClick={() => setMenuOpen(false)}
            >
              Animais
            </Link>
            <Link
              to="/contato"
              className="flex min-h-11 items-center py-2 text-[#2E7D6B] transition-colors hover:text-[#E4B04A]"
              onClick={() => setMenuOpen(false)}
            >
              Contato
            </Link>
            <Link
              to="/animais"
              className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-[#E4B04A] px-6 py-3 text-center text-white transition-all hover:bg-[#d4a03a]"
              onClick={() => setMenuOpen(false)}
            >
              Quero Adotar
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
