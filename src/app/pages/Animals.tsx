import { useState } from "react"

import { Search, Filter, PawPrint } from "lucide-react"

import { useAsync } from "../hooks/useAsync"

import { listPublicAnimals } from "../services/supabase-animals"

import { AnimalCard } from "../components/AnimalCard"

type SituationFilter = "all" | "available" | "adopted"

const situationOptions: Array<{
  value: SituationFilter
  label: string
}> = [
  { value: "all", label: "Todos" },
  { value: "available", label: "Disponíveis" },
  { value: "adopted", label: "Adotados" },
]

export function Animals() {
  const [searchTerm, setSearchTerm] = useState("")

  const [speciesFilter, setSpeciesFilter] = useState<"all" | "dog" | "cat">(
    "all",
  )

  const [situationFilter, setSituationFilter] = useState<SituationFilter>("all")

  const { data, status, reload } = useAsync("animals", () =>
    listPublicAnimals(),
  )

  const filteredAnimals = (data ?? []).filter((animal) => {
    const matchesSearch = animal.name

      .toLowerCase()

      .includes(searchTerm.toLowerCase())

    const matchesSpecies =
      speciesFilter === "all" || animal.species === speciesFilter

    const matchesSituation =
      situationFilter === "all" || animal.status === situationFilter

    return matchesSearch && matchesSpecies && matchesSituation
  })

  const hasActiveFilters =
    searchTerm !== "" || speciesFilter !== "all" || situationFilter !== "all"

  const emptyCatalogMessage =
    situationFilter === "adopted"
      ? "Nenhum animal adotado registrado ainda."
      : "Nenhum animal disponível no momento."

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
            seu novo melhor amigo. Quem já encontrou um lar também tem sua
            história aqui.
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
                <option value="dog">Caninos</option>
                <option value="cat">Felinos</option>
              </select>
            </div>
          </div>

          {/* Situation Filter */}
          <div
            className="mt-4 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filtrar por situação"
          >
            <span className="text-sm font-medium text-[#527f74]">
              Situação:
            </span>
            {situationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={situationFilter === option.value}
                onClick={() => setSituationFilter(option.value)}
                className={`inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E4B04A] ${
                  situationFilter === option.value
                    ? "bg-[#2E7D6B] text-white"
                    : "bg-[#F5EFE6] text-[#2E7D6B] hover:bg-[#2E7D6B]/10"
                }`}
              >
                {option.label}
              </button>
            ))}
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
                : emptyCatalogMessage}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("")

                  setSpeciesFilter("all")

                  setSituationFilter("all")
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
