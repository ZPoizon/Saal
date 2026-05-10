import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { mockAnimals, type AnimalStatus } from "../data/animals";
import { AnimalCard } from "../components/AnimalCard";

export function Animals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<"all" | "dog" | "cat">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AnimalStatus>("all");

  const filteredAnimals = mockAnimals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = speciesFilter === "all" || animal.species === speciesFilter;
    const matchesStatus = statusFilter === "all" || animal.status === statusFilter;
    return matchesSearch && matchesSpecies && matchesStatus;
  });

  return (
    <div className="py-12 bg-[#F5EFE6] min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2E7D6B] mb-4">
            Nossos Animais
          </h1>
          <p className="text-[#6FAE9C] max-w-2xl mx-auto">
            Encontre seu novo melhor amigo. Todos estão esperando por um lar cheio de amor.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6FAE9C]" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
              />
            </div>

            {/* Species Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6FAE9C]" size={20} />
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A] appearance-none cursor-pointer"
              >
                <option value="all">Todas as Espécies</option>
                <option value="dog">Cachorros</option>
                <option value="cat">Gatos</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6FAE9C]" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A] appearance-none cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="available">Disponível</option>
                <option value="treatment">Em Tratamento</option>
                <option value="adopted">Adotados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-[#6FAE9C]">
            {filteredAnimals.length} {filteredAnimals.length === 1 ? "animal encontrado" : "animais encontrados"}
          </p>
        </div>

        {/* Animals Grid */}
        {filteredAnimals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#6FAE9C] text-lg">
              Nenhum animal encontrado com esses filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
