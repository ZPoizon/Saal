import { useCallback, useEffect, useRef, useState } from "react"

export type AsyncStatus = "loading" | "success" | "error"

export interface AsyncResult<T> {
  data: T | undefined

  status: AsyncStatus

  error: unknown

  reload: () => void
}

/**
 * Executa um carregamento assíncrono e expõe estados explícitos de carregando,
 * sucesso e erro. Nunca inventa dados: quando a API falha, `status` vira "error"
 * e `data` permanece indefinido.
 *
 * O carregamento é reiniciado quando `key` muda ou quando `reload` é chamado.
 */
export function useAsync<T>(
  key: string,

  loader: () => Promise<T>,
): AsyncResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)

  const [status, setStatus] = useState<AsyncStatus>("loading")

  const [error, setError] = useState<unknown>(undefined)

  const [reloadToken, setReloadToken] = useState(0)

  const loaderRef = useRef(loader)

  useEffect(() => {
    loaderRef.current = loader
  })

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    let active = true

    setStatus("loading")

    setError(undefined)

    loaderRef

      .current()

      .then((result) => {
        if (!active) return

        setData(result)

        setStatus("success")
      })

      .catch((cause: unknown) => {
        if (!active) return

        setError(cause)

        setStatus("error")
      })

    return () => {
      active = false
    }
  }, [key, reloadToken])

  return { data, status, error, reload }
}
