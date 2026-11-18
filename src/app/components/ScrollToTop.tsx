import { useEffect } from "react"

import { useLocation } from "react-router"

/**
 * Garante que toda navegação entre rotas inicie a página no topo.
 *
 * Interações dentro da mesma página (abrir modais, trocar abas, lightbox)
 * não são afetadas, pois este componente reage apenas a mudanças de `pathname`.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Rolamento suave desligado para evitar saltos visuais em mobile.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    })
  }, [pathname, search])

  return null
}
