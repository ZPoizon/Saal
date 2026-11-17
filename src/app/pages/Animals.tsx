import { useState } from "react"

import { Search, Filter, PawPrint } from "lucide-react"

import { useAsync } from "../hooks/useAsync"

import { listPublicAnimals } from "../services/animals-api"

import { AnimalCard } from "../components/AnimalCard"

export function Animals() {
  const [searchTerm, setSearchTerm] = useState("")

  const [speciesFilter, setSpeciesFilter] = useState<"all" | "dog" | "cat">(
    "all",
  )

  const { data, status, reload } = useAsync("animals", () =>
    listPublicAnimals(),
  )

  const filteredAnimals = (data ?? []).filter((animal) => {
    const matchesSearch = animal.name

      .toLowerCase()

      .includes(searchTerm.toLowerCase())

    const matchesSpecies =
      speciesFilter === "all" || animal.species === speciesFilter

    return matchesSearch && matchesSpecies
  })

  const hasActiveFilters = searchTerm !== "" || speciesFilter !== "all"

  return (
    <div className="min-h-screen bg-[#F5EFE6] py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-4 text-3xl font-bold text-[#2E7D6B] sm:text-4xl md:text-5xl">
            Nossos Animais
          </h1>
          <p className="text-[#527f74] max-w-2xl mx-auto">
            Conheça os animais que estão disponíveis neste momento e encontre
            seu novo melhor amigo.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl bg-white p-4 shadow-md sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6FAE9C]"
                size={20}
              />
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
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6FAE9C]"
                size={20}
              />
              <select
                value={speciesFilter}
                onChange={(e) =>
                  setSpeciesFilter(e.target.value as "all" | "dog" | "cat")
                }
                className="w-full pl-10 pr-4 py-3 bg-[#F5EFE6] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#E4B04A] appearance-none cursor-pointer"
              >
                <option value="all">Todas as Espécies</option>
                <option value="dog">Cachorros</option>
                <option value="cat">Gatos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {status === "success" && (
          <div className="mb-6">
            <p className="text-[#6FAE9C]">
              {filteredAnimals.length}{" "}
              {filteredAnimals.length === 1
                ? "animal encontrado"
                : "animais encontrados"}
            </p>
          </div>
        )}

        {/* Animals Grid */}
        {status === "loading" ? (
          <div className="rounded-2xl bg-white px-4 py-12 text-center shadow-sm sm:py-16 sm:px-6">
            <p role="status" className="text-[#2E7D6B] text-lg font-semibold">
              Carregando animais…
            </p>
          </div>
        ) : status === "error" ? (
          <div className="rounded-2xl bg-white px-4 py-12 text-center shadow-sm sm:py-16 sm:px-6">
            <PawPrint className="mx-auto mb-4 text-[#E4B04A]" size={40} />
            <p role="alert" className="text-[#2E7D6B] text-lg font-semibold">
              Não foi possível carregar os animais agora.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#527f74] underline underline-offset-4 hover:text-[#E4B04A]"
            >
              Tentar novamente
            </button>
          </div>
        ) : filteredAnimals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-4 py-12 text-center shadow-sm sm:py-16 sm:px-6">
            <PawPrint className="mx-auto mb-4 text-[#E4B04A]" size={40} />
            <p className="text-[#2E7D6B] text-lg font-semibold">
              {hasActiveFilters
                ? "Nenhum animal encontrado com esses filtros."
                : "Nenhum animal disponível no momento."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("")

                  setSpeciesFilter("all")
                }}
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#527f74] underline underline-offset-4 hover:text-[#E4B04A]"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
