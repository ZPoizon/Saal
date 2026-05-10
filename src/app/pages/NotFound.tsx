import { Link } from "react-router";
import { Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Search className="w-24 h-24 text-[#6FAE9C] mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-[#2E7D6B] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-[#2E7D6B] mb-3">
            Página não encontrada
          </h2>
          <p className="text-[#6FAE9C]">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#E4B04A] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#d4a03a] transition-all shadow-md hover:shadow-lg"
        >
          <Home size={20} />
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
