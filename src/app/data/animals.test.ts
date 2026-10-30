import { describe, expect, it } from "vitest"

import { getAnimalById, getAvailableAnimals, mockAnimals } from "./animals"

describe("animal data helpers", () => {
  it("returns only animals currently marked available", () => {
    const availableIds = mockAnimals

      .filter((animal) => animal.status === "available")

      .map((animal) => animal.id)

    expect(getAvailableAnimals().map((animal) => animal.id)).toEqual(
      availableIds,
    )

    expect(
      getAvailableAnimals().every((animal) => animal.status === "available"),
    ).toBe(true)
  })

  it("returns an animal by id and undefined for an unknown id", () => {
    expect(getAnimalById("1")?.name).toBe("Thor")

    expect(getAnimalById("unknown")).toBeUndefined()
  })

  it("uses only approved statuses and the approved photo count", () => {
    expect(
      mockAnimals.every(
        (animal) =>
          (animal.status === "available" || animal.status === "adopted") &&
          animal.images.length >= 1 &&
          animal.images.length <= 3,
      ),
    ).toBe(true)
  })
})
