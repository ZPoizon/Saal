/**
 * Acrescenta parâmetros de imagem a uma URL já existente sem duplicar o separador.
 * Preserva o comportamento anterior (`?w=...&h=...&fit=crop`) e continua correto
 * quando a URL já traz uma query string.
 */
export function withImageParams(
  url: string,

  params: Record<string, string | number>,
): string {
  if (!url) return url

  const separator = url.includes("?") ? "&" : "?"

  const query = Object.entries(params)

    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )

    .join("&")

  return query ? `${url}${separator}${query}` : url
}
