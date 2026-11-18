import { useMemo, useState } from "react"

import { ChevronDown, ChevronUp, History, RefreshCw } from "lucide-react"

import {
  formatAdoptionDate,
  isLegacyAdoption,
  type AdoptionRecord,
  type Animal,
} from "../../data/animals"
import {
  filterAdoptionHistory,
  getAdoptionHistoryStats,
  type AdoptionHistoryFilters,
} from "../../data/adoption-history"
import {
  buildAdoptionHistoryDetails,
  type AdoptionHistoryDetails,
} from "../../data/adoption-history-details"

interface AdoptionHistoryPanelProps {
  adoptions: AdoptionRecord[]
  animals: Animal[]
  status: "loading" | "success" | "error"
  message: string | null
  onReload: () => void
  onReverse: (adoption: AdoptionRecord) => void
  onRegularize: (animal: Animal) => void
}

interface DetailRowProps {
  label: string
  value: string | null
}

function DetailRow({ label, value }: DetailRowProps) {
  if (!value) return null

  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#6FAE9C]">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-line break-words text-sm text-[#416f65]">
        {value}
      </dd>
    </div>
  )
}

interface QuickFact {
  label: string
  value: string
}

function AdoptionDetails({ details }: { details: AdoptionHistoryDetails }) {
  const quickFacts: QuickFact[] = [
    { label: "Espécie", value: details.animal.species },
    { label: "Sexo", value: details.animal.sex },
    { label: "Porte", value: details.animal.size },
    { label: "Idade", value: details.animal.age },
  ].flatMap((fact) => (fact.value ? [{ ...fact, value: fact.value }] : []))

  return (
    <div className="mt-4 rounded-xl border border-[#F5EFE6] bg-[#FBF8F3] p-4">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickFacts.map((fact) => (
          <DetailRow key={fact.label} label={fact.label} value={fact.value} />
        ))}
        <DetailRow label="Origem" value={details.origin} />
        <DetailRow
          label="Data da adoção"
          value={formatAdoptionDate(details.adoptionDate)}
        />
        <DetailRow
          label="Contato do adotante"
          value={
            details.contacts.length > 0 ? details.contacts.join(" • ") : null
          }
        />
        <DetailRow
          label="Registrada em"
          value={new Date(details.confirmedAt).toLocaleString("pt-BR")}
        />
        <DetailRow label="Descrição" value={details.animal.description} />
        <DetailRow label="Personalidade" value={details.animal.personality} />
        <DetailRow
          label="Informações de saúde"
          value={details.animal.medicalInfo}
        />
        <DetailRow label="Observações" value={details.notes} />
        <DetailRow label="Motivo da reversão" value={details.reversalReason} />
      </dl>
      <p className="mt-4 border-t border-[#F5EFE6] pt-3 text-xs text-[#6FAE9C]">
        Registro textual preservado após o arquivamento. As fotografias não
        fazem parte do histórico.
      </p>
    </div>
  )
}

export function AdoptionHistoryPanel({
  adoptions,
  animals,
  status,
  message,
  onReload,
  onReverse,
  onRegularize,
}: AdoptionHistoryPanelProps) {
  const [filters, setFilters] = useState<AdoptionHistoryFilters>({
    status: "all",
    search: "",
  })
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())

  const stats = useMemo(() => getAdoptionHistoryStats(adoptions), [adoptions])
  const filtered = useMemo(
    () => filterAdoptionHistory(adoptions, filters),
    [adoptions, filters],
  )

  const animalsWithAdoption = new Set(
    adoptions.map((adoption) => adoption.animalId).filter(Boolean),
  )
  const legacyWithoutRecord = animals.filter(
    (animal) => isLegacyAdoption(animal) && !animalsWithAdoption.has(animal.id),
  )

  const toggleDetails = (adoptionId: string) => {
    setExpanded((current) => {
      const next = new Set(current)

      if (next.has(adoptionId)) {
        next.delete(adoptionId)
      } else {
        next.add(adoptionId)
      }

      return next
    })
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#2E7D6B] sm:text-xl">
              <History size={20} className="text-[#E4B04A]" />
              Histórico de adoções
            </h2>
            <p className="mt-1 text-sm text-[#6FAE9C]">
              Registros textuais das adoções confirmadas. O acesso é restrito à
              administração.
            </p>
          </div>
          <button
            type="button"
            onClick={onReload}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#2E7D6B] px-4 py-2 text-sm font-semibold text-[#2E7D6B] transition-colors hover:bg-[#F5EFE6]"
          >
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ["Total", stats.total],
            ["Ativas", stats.active],
            ["Revertidas", stats.reversed],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#F5EFE6] p-3">
              <dt className="text-xs font-semibold text-[#527f74]">{label}</dt>
              <dd className="mt-1 text-2xl font-bold text-[#2E7D6B]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {legacyWithoutRecord.length > 0 && (
        <div className="rounded-2xl border border-[#6FAE9C]/60 bg-white p-4 shadow-md sm:p-6">
          <h3 className="font-bold text-[#2E7D6B]">
            Adoções legadas sem data registrada
          </h3>
          <p className="mt-1 text-sm text-[#416f65]">
            Estes animais permanecem no catálogo até que a data real da adoção
            seja informada. Nenhuma data é presumida.
          </p>
          <ul className="mt-3 space-y-2">
            {legacyWithoutRecord.map((animal) => (
              <li
                key={animal.id}
                className="flex flex-col gap-2 rounded-lg bg-[#F5EFE6] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-semibold text-[#2E7D6B]">
                  {animal.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRegularize(animal)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2E7D6B] px-3 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-white"
                >
                  Regularizar data real
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="history-search"
              className="mb-1 block text-sm text-[#2E7D6B]"
            >
              Buscar por animal ou adotante
            </label>
            <input
              id="history-search"
              type="search"
              value={filters.search ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              className="w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
            />
          </div>
          <div>
            <label
              htmlFor="history-status"
              className="mb-1 block text-sm text-[#2E7D6B]"
            >
              Situação
            </label>
            <select
              id="history-status"
              value={filters.status ?? "all"}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target
                    .value as AdoptionHistoryFilters["status"],
                }))
              }
              className="min-h-11 w-full rounded-lg border-none bg-[#F5EFE6] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E4B04A]"
            >
              <option value="all">Todas</option>
              <option value="active">Ativas</option>
              <option value="reversed">Revertidas</option>
            </select>
          </div>
        </div>

        {status === "loading" ? (
          <p role="status" className="py-8 text-center text-[#6FAE9C]">
            Carregando histórico…
          </p>
        ) : status === "error" ? (
          <div className="py-8 text-center">
            <p role="alert" className="text-[#2E7D6B]">
              {message ?? "Não foi possível carregar o histórico."}
            </p>
            <button
              type="button"
              onClick={onReload}
              className="mt-3 text-sm font-semibold text-[#527f74] underline underline-offset-4 hover:text-[#E4B04A]"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-[#6FAE9C]">
            Nenhuma adoção encontrada com esses filtros.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {filtered.map((adoption) => {
              const animal =
                animals.find(
                  (candidate) => candidate.id === adoption.animalId,
                ) ?? null
              const details = buildAdoptionHistoryDetails(adoption, animal)
              const isExpanded = expanded.has(adoption.id)
              const detailsId = `adoption-details-${adoption.id}`
              const summary = [
                details.animal.species,
                details.animal.sex,
                details.animal.size,
                details.animal.age,
              ].filter((value): value is string => Boolean(value))

              return (
                <li
                  key={adoption.id}
                  className="rounded-xl border border-[#F5EFE6] bg-white p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#2E7D6B]">
                          {details.animal.name}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            details.isActive
                              ? "bg-[#2E7D6B]/10 text-[#2E7D6B]"
                              : "bg-[#E4B04A]/15 text-[#6b4e12]"
                          }`}
                        >
                          {details.isActive ? "Adoção ativa" : "Revertida"}
                        </span>
                        <span className="rounded-full bg-[#F5EFE6] px-2 py-0.5 text-xs font-semibold text-[#527f74]">
                          {details.origin}
                        </span>
                      </div>

                      {summary.length > 0 && (
                        <p className="mt-1 text-sm text-[#6FAE9C]">
                          {summary.join(" • ")}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-[#416f65]">
                        Adotante: {details.adopterName} • Adoção em{" "}
                        {formatAdoptionDate(details.adoptionDate)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDetails(adoption.id)}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-[#6FAE9C] px-3 py-2 text-sm font-semibold text-[#416f65] transition-colors hover:bg-[#F5EFE6]"
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                      </button>

                      {details.isActive &&
                        animal &&
                        isLegacyAdoption(animal) && (
                          <button
                            type="button"
                            onClick={() => onRegularize(animal)}
                            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E4B04A] px-3 py-2 text-sm font-semibold text-[#6b4e12] hover:bg-[#E4B04A]/10"
                          >
                            Regularizar data
                          </button>
                        )}

                      {details.isActive && (
                        <button
                          type="button"
                          onClick={() => onReverse(adoption)}
                          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2E7D6B] px-3 py-2 text-sm font-semibold text-[#2E7D6B] hover:bg-[#F5EFE6]"
                        >
                          Reverter adoção
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div id={detailsId}>
                      <AdoptionDetails details={details} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
