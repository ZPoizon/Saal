import { describe, expect, it } from "vitest"

import { fitWithin, isPhotoStorageConfigured } from "./photo-storage"

describe("fitWithin", () => {
  it("não amplia imagens menores que o limite", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })

  it("reduz proporcionalmente uma foto horizontal", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 })
  })

  it("reduz proporcionalmente uma foto vertical", () => {
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 })
  })

  it("nunca produz dimensão zero", () => {
    expect(fitWithin(10000, 1, 1600)).toEqual({ width: 1600, height: 1 })
  })
})

describe("configuração do armazenamento local", () => {
  it("está sempre configurado no modo protótipo local", () => {
    expect(isPhotoStorageConfigured()).toBe(true)
  })
})
