import { describe, expect, it } from "vitest"

import { withImageParams } from "./images"

describe("withImageParams", () => {
  it("acrescenta os parâmetros com ? quando a URL não tem query string", () => {
    expect(
      withImageParams("https://exemplo.com/foto.jpg", {
        w: 500,

        h: 500,

        fit: "crop",
      }),
    ).toBe("https://exemplo.com/foto.jpg?w=500&h=500&fit=crop")
  })

  it("usa & quando a URL já possui query string, sem duplicar o separador", () => {
    expect(
      withImageParams("https://exemplo.com/foto.jpg?token=abc", {
        w: 200,

        h: 200,
      }),
    ).toBe("https://exemplo.com/foto.jpg?token=abc&w=200&h=200")
  })

  it("codifica os valores dos parâmetros", () => {
    expect(
      withImageParams("https://exemplo.com/foto.jpg", { fit: "crop center" }),
    ).toBe("https://exemplo.com/foto.jpg?fit=crop%20center")
  })

  it("devolve a própria URL quando ela é vazia", () => {
    expect(withImageParams("", { w: 100 })).toBe("")
  })
})
