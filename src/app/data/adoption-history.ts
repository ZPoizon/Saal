import type { AdoptionRecord } from "./animals"
import { ADOPTION_PHOTO_RETENTION_MS, toLifecycleTimestamp } from "./animals"

export interface AdoptionHistoryStats {
  total: number
  active: number
  reversed: number
  cleanupPending: number
  cleanupCompleted: number
  cleanupFailed: number
  expiringSoon: number
  expiredPendingCleanup: number
}

export interface AdoptionHistoryFilters {
  search?: string
  status?: "all" | "active" | "reversed" | "cleanup-pending" | "cleanup-failed"
}

export function isAdoptionActive(record: AdoptionRecord): boolean {
  return record.reversedAt === null
}

/** Adoção ativa mais recente de cada animal, usada para detectar duplicidade. */
export function findActiveAdoption(
  records: readonly AdoptionRecord[],
  animalId: string,
): AdoptionRecord | null {
  return (
    records.find(
      (record) => record.animalId === animalId && isAdoptionActive(record),
    ) ?? null
  )
}

export function getAdoptionHistoryStats(
  records: readonly AdoptionRecord[],
  now: Date = new Date(),
): AdoptionHistoryStats {
  const stats: AdoptionHistoryStats = {
    total: records.length,
    active: 0,
    reversed: 0,
    cleanupPending: 0,
    cleanupCompleted: 0,
    cleanupFailed: 0,
    expiringSoon: 0,
    expiredPendingCleanup: 0,
  }

  for (const record of records) {
    if (isAdoptionActive(record)) {
      stats.active += 1
    } else {
      stats.reversed += 1
    }

    if (record.cleanupStatus === "completed") {
      stats.cleanupCompleted += 1
    } else if (record.cleanupStatus === "failed") {
      stats.cleanupFailed += 1
    } else if (
      isAdoptionActive(record) &&
      (record.cleanupStatus === "pending" ||
        record.cleanupStatus === "scheduled")
    ) {
      stats.cleanupPending += 1
    }

    if (!isAdoptionActive(record) || record.cleanupStatus === "completed") {
      continue
    }

    const adoptedAt = toLifecycleTimestamp(record.adoptionDate)

    if (adoptedAt === null) continue

    const remaining = adoptedAt + ADOPTION_PHOTO_RETENTION_MS - now.getTime()

    if (remaining <= 0) {
      stats.expiredPendingCleanup += 1
    } else if (remaining <= 7 * 24 * 60 * 60 * 1000) {
      stats.expiringSoon += 1
    }
  }

  return stats
}

export function filterAdoptionHistory(
  records: readonly AdoptionRecord[],
  filters: AdoptionHistoryFilters = {},
): AdoptionRecord[] {
  const term = filters.search?.trim().toLowerCase() ?? ""
  const status = filters.status ?? "all"

  return records.filter((record) => {
    const matchesSearch =
      term === "" ||
      record.animalName.toLowerCase().includes(term) ||
      record.adopterName.toLowerCase().includes(term) ||
      (record.adopterEmail ?? "").toLowerCase().includes(term) ||
      (record.adopterPhone ?? "").toLowerCase().includes(term)

    if (!matchesSearch) return false

    switch (status) {
      case "active":
        return isAdoptionActive(record)
      case "reversed":
        return !isAdoptionActive(record)
      case "cleanup-pending":
        return (
          isAdoptionActive(record) &&
          (record.cleanupStatus === "pending" ||
            record.cleanupStatus === "scheduled")
        )
      case "cleanup-failed":
        return record.cleanupStatus === "failed"
      default:
        return true
    }
  })
}
