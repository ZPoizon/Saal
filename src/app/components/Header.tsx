import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoSaal from "../../imports/logo_fundo_0.png";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoSaal}
              alt="SAAL - Santuário de Animais Anjos da Luz"
              className="w-14 h-14 md:w-16 md:h-16 object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <h1 className="text-[#2E7D6B] font-bold text-lg leading-tight">SAAL</h1>
              <p className="text-xs text-[#6FAE9C]">Santuário de Animais Anjos da Luz</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-[#2E7D6B] hover:text-[#E4B04A] transition-colors">
              Início
            </Link>
            <Link to="/animais" className="text-[#2E7D6B] hover:text-[#E4B04A] transition-colors">
              Animais
            </Link>
            <Link to="/contato" className="text-[#2E7D6B] hover:text-[#E4B04A] transition-colors">
              Contato
            </Link>
            <Link
              to="/animais"
              className="bg-[#E4B04A] text-white px-6 py-2 rounded-full hover:bg-[#d4a03a] transition-all shadow-md hover:shadow-lg"
            >
              Quero Adotar
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#2E7D6B] p-2"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3">
            <Link
              to="/"
              className="text-[#2E7D6B] hover:text-[#E4B04A] py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/animais"
              className="text-[#2E7D6B] hover:text-[#E4B04A] py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Animais
            </Link>
            <Link
              to="/contato"
              className="text-[#2E7D6B] hover:text-[#E4B04A] py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Contato
            </Link>
            <Link
              to="/animais"
              className="bg-[#E4B04A] text-white px-6 py-3 rounded-full text-center hover:bg-[#d4a03a] transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Quero Adotar
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
