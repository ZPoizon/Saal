// SAAL — Limpeza automática das fotos de adoções com 30 dias completos.
//
// Esta função é executada por um agendamento do Supabase (pg_cron + pg_net ou
// Cron do painel), nunca pelo navegador. Ela usa `service_role`, chama a API
// oficial do Storage e registra o resultado por adoção no banco.
//
// Configuração (somente no servidor, uma única vez):
//   supabase functions deploy cleanup-adopted-photos --no-verify-jwt
//   supabase secrets set ADOPTION_CLEANUP_SECRET=<segredo-aleatorio-longo>
//
// O agendamento deve enviar o cabeçalho `x-cleanup-secret` com o mesmo valor
// (ou `Authorization: Bearer <segredo>`). Sem `ADOPTION_CLEANUP_SECRET`
// configurado a função responde 503 e não executa nada.
//
// A regra de negócio e a validação de propriedade ficam em
// `../_shared/adoption-photo-cleanup.ts`, cobertas por testes.
//
// A exclusão só é registrada no banco depois de a Storage API confirmar que o
// objeto não existe mais. O banco valida novamente o estado da adoção, a janela
// de 30 dias e a propriedade das URLs antes de aceitar "completed".

import { createClient } from "npm:@supabase/supabase-js@2"

import {
  ANIMAL_PHOTO_BUCKET,
  animalPhotoFileName,
  confirmAnimalPhotoRemoval,
  isCleanupSecretValid,
  isValidAnimalPhotoPath,
  runAdoptionPhotoCleanup,
  type AdoptionCleanupCandidate,
  type AdoptionCleanupStatus,
  type CleanupAnimal,
} from "../_shared/adoption-photo-cleanup.ts"

interface CandidateRow {
  adoption_id: string
  animal_id: string | null
  animal_name: string
  adopted_at: string | null
  cleanup_status: AdoptionCleanupStatus
}

interface AnimalRow {
  id: string
  status: string
  images: string[] | null
}

interface PhotoRow {
  animal_id: string
  storage_path: string
}

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status })
}

function presentedSecret(request: Request): string | null {
  const headerSecret = request.headers.get("x-cleanup-secret")

  if (headerSecret) return headerSecret

  const authorization = request.headers.get("authorization")

  if (!authorization) return null

  const [scheme, token] = authorization.split(" ")

  if (scheme?.toLowerCase() !== "bearer" || !token) return null

  return token
}

function isAuthorized(request: Request): boolean {
  const expected = Deno.env.get("ADOPTION_CLEANUP_SECRET")

  return isCleanupSecretValid(expected, presentedSecret(request))
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" })
  }

  if (!Deno.env.get("ADOPTION_CLEANUP_SECRET")) {
    return json(503, {
      error: "Limpeza automática não configurada no servidor.",
    })
  }

  if (!isAuthorized(request)) {
    return json(401, { error: "Não autorizado." })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, {
      error: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes.",
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const now = new Date()

  const candidatesResult = await supabase.rpc(
    "list_adoption_cleanup_candidates",
    { p_now: now.toISOString() },
  )

  if (candidatesResult.error) {
    return json(500, { error: "Falha ao listar adoções elegíveis." })
  }

  const animalsResult = await supabase
    .from("animals")
    .select("id, status, images")

  if (animalsResult.error) {
    return json(500, { error: "Falha ao carregar os animais." })
  }

  const photosResult = await supabase
    .from("animal_photos")
    .select("animal_id, storage_path")

  if (photosResult.error) {
    return json(500, { error: "Falha ao carregar as referências de fotos." })
  }

  const candidates: AdoptionCleanupCandidate[] = ((candidatesResult.data ??
    []) as CandidateRow[]).map((row) => ({
    adoptionId: row.adoption_id,
    animalId: row.animal_id,
    animalName: row.animal_name,
    adoptedAt: row.adopted_at,
    cleanupStatus: row.cleanup_status,
  }))

  const animals: CleanupAnimal[] = ((animalsResult.data ??
    []) as AnimalRow[]).map((row) => ({
    id: row.id,
    status: row.status,
    images: row.images ?? [],
  }))

  const photoReferences = ((photosResult.data ?? []) as PhotoRow[]).map(
    (row) => ({
      animalId: row.animal_id,
      storagePath: row.storage_path,
    }),
  )

  try {
    const report = await runAdoptionPhotoCleanup({ now, supabaseUrl }, {
      listCandidates: async () => candidates,
      listAnimals: async () => animals,
      listPhotoReferences: async () => photoReferences,
      removePaths: async (paths) => {
        const removed: string[] = []
        const errors: string[] = []

        for (const path of paths) {
          // Defesa adicional: nunca enviar ao Storage um caminho fora do
          // padrão `animals/<uuid>.<ext>` do bucket `animal-photos`.
          if (!isValidAnimalPhotoPath(path)) {
            errors.push("Caminho de foto inválido; exclusão recusada.")
            continue
          }

          const { data, error } = await supabase.storage
            .from(ANIMAL_PHOTO_BUCKET)
            .remove([path])

          if (error) {
            errors.push(`Falha ao remover ${path}: ${error.message}`)
            continue
          }

          const removedNames = (data ?? []).map((file) => file.name)

          // `remove` pode responder sem erro e sem devolver o nome do arquivo.
          // Antes de informar a remoção ao banco, confirma pela Storage API que
          // o objeto não aparece mais na pasta.
          let listing: { name: string }[] = []

          if (!removedNames.includes(path)) {
            const fileName = animalPhotoFileName(path)

            if (!fileName) {
              errors.push("Caminho de foto inválido; exclusão não confirmada.")
              continue
            }

            const listed = await supabase.storage
              .from(ANIMAL_PHOTO_BUCKET)
              .list("animals", { search: fileName, limit: 100 })

            if (listed.error) {
              errors.push(
                `Falha ao confirmar a remoção de ${path}: ${listed.error.message}`,
              )
              continue
            }

            listing = (listed.data ?? []).map((file) => ({ name: file.name }))
          }

          const confirmation = confirmAnimalPhotoRemoval(path, {
            removedNames,
            listing,
          })

          if (confirmation.confirmed) {
            removed.push(path)
          } else {
            errors.push(
              confirmation.reason ??
                `O Storage não confirmou a remoção de ${path}.`,
            )
          }
        }

        return { removed, errors }
      },
      recordCleanup: async (adoptionId, status, removedUrls, cleanupError) => {
        const { error } = await supabase.rpc("record_adoption_cleanup", {
          p_adoption_id: adoptionId,
          p_status: status,
          p_removed_urls: removedUrls,
          p_error: cleanupError,
        })

        if (error) {
          throw new Error(error.message)
        }
      },
    })

    return json(200, {
      checked: report.checked,
      completed: report.completed,
      failed: report.failed,
      skipped: report.skipped,
      items: report.items.map((item) => ({
        adoptionId: item.adoptionId,
        status: item.status,
        removed: item.removedPaths.length,
        reason: item.reason,
      })),
    })
  } catch (error) {
    // Não expor detalhes internos no corpo da resposta; o agendador registra
    // o status HTTP e a equipe consulta os logs protegidos.
    console.error(
      "cleanup-adopted-photos:",
      error instanceof Error ? error.message : "erro desconhecido",
    )

    return json(500, { error: "Falha ao executar a limpeza automática." })
  }
})
