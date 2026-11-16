import { describe, expect, it } from "vitest"

import {
  MAX_ANIMAL_PHOTOS,
  MAX_PHOTO_BYTES,
  formatFileSize,
  moveListItem,
  selectPhotoFiles,
} from "./photo-selection"

function file(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe("selectPhotoFiles", () => {
  it("aceita imagens dentro do limite", () => {
    const result = selectPhotoFiles(
      [file("a.png", "image/png", 10), file("b.jpg", "image/jpeg", 20)],
      0,
    )

    expect(result.accepted).toHaveLength(2)

    expect(result.errors).toEqual([])
  })

  it("recusa arquivos que não são imagem", () => {
    const result = selectPhotoFiles([file("doc.pdf", "application/pdf", 10)], 0)

    expect(result.accepted).toHaveLength(0)

    expect(result.errors[0]).toContain("não é uma imagem")
  })

  it("recusa imagem acima do limite técnico provisório", () => {
    const result = selectPhotoFiles(
      [file("grande.png", "image/png", MAX_PHOTO_BYTES + 1)],
      0,
    )

    expect(result.accepted).toHaveLength(0)

    expect(result.errors[0]).toContain(formatFileSize(MAX_PHOTO_BYTES))
  })

  it("respeita o máximo de fotos já existentes", () => {
    const result = selectPhotoFiles(
      [file("a.png", "image/png", 10)],
      MAX_ANIMAL_PHOTOS,
    )

    expect(result.accepted).toHaveLength(0)

    expect(result.errors[0]).toContain(`limite é de ${MAX_ANIMAL_PHOTOS}`)
  })

  it("não aceita além das vagas restantes", () => {
    const result = selectPhotoFiles(
      [
        file("a.png", "image/png", 10),
        file("b.png", "image/png", 10),
        file("c.png", "image/png", 10),
      ],
      1,
    )

    expect(result.accepted).toHaveLength(2)

    expect(
      result.errors.some((message) => message.includes("mais fotos")),
    ).toBe(true)
  })

  it("ignora arquivo repetido", () => {
    const duplicate = file("a.png", "image/png", 10)

    const result = selectPhotoFiles([duplicate, duplicate], 0)

    expect(result.accepted).toHaveLength(1)

    expect(result.errors[0]).toContain("já foi adicionada")
  })
})

describe("moveListItem", () => {
  it("move o item para a posição solicitada", () => {
    expect(moveListItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"])

    expect(moveListItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"])
  })

  it("devolve cópia quando a posição é inválida", () => {
    const items = ["a", "b"]

    expect(moveListItem(items, 1, 5)).toEqual(items)

    expect(moveListItem(items, 1, 5)).not.toBe(items)
  })
})
