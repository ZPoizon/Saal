import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const MIGRATION_003 = readFileSync(
  new URL(
    "../../../supabase/migrations/003_add_treatment_status_and_lifecycle.sql",
    import.meta.url,
  ),
  "utf8",
)

const MIGRATION_004 = readFileSync(
  new URL(
    "../../../supabase/migrations/004_adoptions_history_and_cleanup.sql",
    import.meta.url,
  ),
  "utf8",
)

const MIGRATION_005 = readFileSync(
  new URL(
    "../../../supabase/migrations/005_adoption_animal_snapshots.sql",
    import.meta.url,
  ),
  "utf8",
)

const CLEANUP_FUNCTION = readFileSync(
  new URL(
    "../../../supabase/functions/cleanup-adopted-photos/index.ts",
    import.meta.url,
  ),
  "utf8",
)

function normalized(sql: string): string {
  return sql.toLowerCase().replace(/\s+/g, " ")
}

function expectNoDestructiveSql(sql: string): void {
  const normalizedSql = normalized(sql)

  expect(normalizedSql).not.toMatch(/\bdelete\s+from\s+public\./)
  expect(normalizedSql).not.toMatch(/\btruncate\b/)
  expect(normalizedSql).not.toMatch(/\bdrop\s+table\b/)
  expect(normalizedSql).not.toMatch(/\bdrop\s+column\b/)
}

describe("migração 003 é segura para o esquema existente", () => {
  const sql = normalized(MIGRATION_003)

  it("faz preflight de tabela, tipos e status antes de alterar", () => {
    expect(sql).toContain("migração 003 abortada")
    expect(sql).toContain("to_regclass('public.animals')")
    expect(sql).toContain("timestamp with time zone")
    expect(sql).toContain("status not in ('available', 'adopted', 'treatment')")
    expect(sql).toContain("status is null")
  })

  it("localiza a CHECK antiga pelo catálogo, não apenas pelo nome", () => {
    expect(sql).toContain("drop constraint if exists animals_status_check")
    expect(sql).toContain("pg_constraint")
    expect(sql).toContain("con.conkey")
    expect(sql).toContain("array[v_status_attnum]")
    expect(sql).toContain("add constraint animals_status_check")
    expect(sql).toContain("not valid")
    expect(sql).toContain("validate constraint animals_status_check")
  })

  it("cria as colunas de ciclo de vida de forma idempotente", () => {
    expect(sql).toContain("add column if not exists adopted_at timestamptz")
    expect(sql).toContain("add column if not exists archived_at timestamptz")
  })

  it("não exclui nem reescreve registros existentes", () => {
    expectNoDestructiveSql(MIGRATION_003)
    expect(sql).not.toMatch(/\bupdate\s+public\.animals\b/)
  })
})

describe("migração 004 protege a conclusão da limpeza", () => {
  const sql = normalized(MIGRATION_004)

  it("aceita apenas service_role e estados finais completed/failed", () => {
    expect(sql).toContain("auth.role() is distinct from 'service_role'")
    expect(sql).toContain("p_status not in ('completed', 'failed')")
    expect(sql).toContain(
      "grant execute on function public.record_adoption_cleanup(uuid, text, text[], text) to service_role;",
    )
    expect(sql).toContain(
      "revoke all on function public.record_adoption_cleanup(uuid, text, text[], text) from anon, authenticated;",
    )
    expect(sql).not.toMatch(
      /grant execute on function public\.record_adoption_cleanup\([^)]*\) to authenticated/,
    )
  })

  it("valida adoção ativa, animal adotado, data e janela de 30 dias", () => {
    expect(sql).toContain("for update")
    expect(sql).toContain("v_adoption.reversed_at is not null")
    expect(sql).toContain("v_animal.status <> 'adopted'")
    expect(sql).toContain("v_animal.adopted_at is null")
    expect(sql).toContain("interval '30 days'")
  })

  it("recusa URLs que não pertencem ao animal", () => {
    expect(sql).toContain("not (v_removed <@ v_animal.images)")
  })

  it("só conclui quando não resta nenhuma fotografia referenciada", () => {
    expect(sql).toContain("v_remaining := array(")
    expect(sql).toContain("array_length(v_remaining, 1) is not null")
    expect(sql).toContain("cleanup_completed_at")
  })

  it("verifica duplicidade antes do índice único de adoção ativa", () => {
    expect(sql).toContain("having count(*) > 1")
    expect(sql).toContain("adoptions_one_active_per_animal")
    expect(sql.indexOf("having count(*) > 1")).toBeLessThan(
      sql.indexOf(
        "create unique index if not exists adoptions_one_active_per_animal",
      ),
    )
  })

  it("usa constraints idempotentes e NOT VALID sem reescrever dados", () => {
    expect(sql).toContain("not valid")
    expect(sql).toContain("adoptions_reversal_consistency")
    expect(sql).toContain("adoptions_cleanup_completion")
    expectNoDestructiveSql(MIGRATION_004)
  })

  it("impede excluir animal com adoção ativa", () => {
    expect(sql).toContain("guard_animal_delete_with_active_adoption")
    expect(sql).toContain("guard_animals_active_adoption_delete")
    expect(sql).toContain("before delete on public.animals")
  })

  it("preserva login e cadastro de animais nas policies", () => {
    expect(sql).toContain('drop policy if exists "admin_users_insert_admin"')
    expect(sql).toContain('drop policy if exists "admin_users_update_admin"')
    expect(sql).not.toMatch(/create policy "admin_users_insert/)
    expect(sql).not.toMatch(/create policy "admin_users_update/)
    expect(sql).not.toMatch(/create policy "admin_users_delete/)
    expect(sql).toContain('create policy "admin_users_select_admin"')
    expect(sql).toContain("using (public.is_admin())")
    expect(sql).toContain('create policy "animals_insert_admin"')
    expect(sql).toContain("with check (public.is_admin())")
  })
})

describe("migração 005 preserva a personalidade no snapshot", () => {
  const sql = normalized(MIGRATION_005)

  it("adiciona a coluna e normaliza personalidade jsonb para text[]", () => {
    expect(sql).toContain("add column if not exists animal_personality text[]")
    expect(sql).toContain("normalize_animal_personality")
    expect(sql).toContain("jsonb_array_elements_text")
    expect(sql).toContain("add constraint adoptions_animal_personality_shape")
  })

  it("faz backfill apenas de campos nulos", () => {
    expect(sql).toContain("coalesce( a.animal_personality")
    expect(sql).toContain("a.animal_personality is null")
    expect(sql).toContain("where an.id = a.animal_id")
  })

  it("grava a personalidade nas RPCs de confirmação e regularização", () => {
    const occurrences = sql.match(/animal_personality/g) ?? []

    expect(occurrences.length).toBeGreaterThanOrEqual(3)
    expect(sql).toContain(
      "public.normalize_animal_personality(v_animal.personality)",
    )
  })

  it("não exclui nem reescreve snapshots existentes", () => {
    expectNoDestructiveSql(MIGRATION_005)
    expect(sql).toContain("update public.adoptions as a")
    expect(sql).toContain("coalesce(a.animal_species")
    expect(sql).toContain("coalesce( a.animal_personality")
    expect(sql).not.toMatch(/\bset\s+animal_personality\s*=/)
  })
})

describe("Edge Function confirma a remoção física pela Storage API", () => {
  const source = normalized(CLEANUP_FUNCTION)

  it("consulta o bucket antes de informar a remoção ao banco", () => {
    expect(source).toContain(".remove([path])")
    expect(source).toContain(
      '.list("animals", { search: filename, limit: 100 })',
    )
    expect(source).toContain("confirmanimalphotoremoval")
  })

  it("não trata resposta vazia do remove como confirmação automática", () => {
    expect(source).not.toContain("files.length === 0")
    expect(source).not.toContain("confirmed || files.length")
  })
})
