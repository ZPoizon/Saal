import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";
import logoSaal from "../../imports/logo_fundo_0.png";

export function Footer() {
  return (
    <footer className="bg-[#2E7D6B] text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Missão */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoSaal}
                alt="SAAL"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="font-semibold">SAAL</h3>
                <p className="text-xs text-[#F5EFE6]">Santuário de Animais Anjos da Luz</p>
              </div>
            </div>
            <p className="text-sm text-[#F5EFE6]">
              Resgatando, cuidando e encontrando lares amorosos para animais que precisam de uma segunda chance.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors">
                Início
              </Link>
              <Link to="/animais" className="text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors">
                Animais para Adoção
              </Link>
              <Link to="/contato" className="text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors">
                Contato
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+5515996927636" className="flex items-center gap-2 text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors">
                <Phone size={16} />
                (15) 99692-7636
              </a>
              <a href="mailto:contato@saal.com.br" className="flex items-center gap-2 text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors">
                <Mail size={16} />
                contato@saal.com.br
              </a>
              <a href="https://www.instagram.com/ongsaal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#F5EFE6] hover:text-[#E4B04A] transition-colors">
                <Instagram size={16} />
                @ongsaal
              </a>
              <div className="flex items-start gap-2 text-sm text-[#F5EFE6]">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>Capão Bonito, SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#6FAE9C] mt-8 pt-6 text-center text-sm text-[#F5EFE6]">
          <p>© 2026 SAAL - Santuário de Animais Anjos da Luz. Todos os direitos reservados.</p>
          <p className="text-xs mt-1 text-[#6FAE9C]">ONG sem fins lucrativos • Capão Bonito - SP</p>
        </div>
      </div>
    </footer>
  );
}
