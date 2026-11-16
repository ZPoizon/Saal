import { randomBytes } from "node:crypto"

import { spawn, spawnSync } from "node:child_process"

import { access, readFile, writeFile } from "node:fs/promises"

import path from "node:path"

import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const backend = path.join(root, "backend")

const envFile = path.join(backend, ".env.dev")

const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js")

const composeArgs = [
  "compose",

  "--env-file",

  ".env.dev",

  "-f",

  "compose.dev.yaml",
]

function runDocker(args) {
  const result = spawnSync("docker", [...composeArgs, ...args], {
    cwd: backend,

    stdio: "inherit",
  })

  if (result.error?.code === "ENOENT") {
    throw new Error(
      "Docker não foi encontrado. Abra o Docker Desktop e tente novamente.",
    )
  }

  if (result.status !== 0) {
    throw new Error(`docker compose ${args.join(" ")} falhou.`)
  }
}

function verifyDocker() {
  const result = spawnSync(
    "docker",
    ["info", "--format", "{{.ServerVersion}}"],
    {
      stdio: "ignore",
    },
  )

  if (result.error?.code === "ENOENT") {
    throw new Error(
      "Docker não foi encontrado. Abra o Docker Desktop e tente novamente.",
    )
  }

  if (result.status !== 0) {
    throw new Error("Inicie o Docker Desktop e tente novamente.")
  }
}

async function loadOrCreateLocalCredentials() {
  let contents

  try {
    contents = await readFile(envFile, "utf8")
  } catch (error) {
    if (error.code !== "ENOENT") throw error

    const adminPassword = randomBytes(24).toString("hex")

    const generated = [
      `SAAL_DB_ROOT_PASSWORD=${randomBytes(24).toString("hex")}`,

      `SAAL_DB_RUNTIME_PASSWORD=${randomBytes(24).toString("hex")}`,

      `SAAL_DB_MIGRATION_PASSWORD=${randomBytes(24).toString("hex")}`,

      `SAAL_ADMIN_PASSWORD=${adminPassword}`,

      "",
    ].join("\n")

    try {
      await writeFile(envFile, generated, {
        encoding: "utf8",

        flag: "wx",

        mode: 0o600,
      })

      contents = generated

      console.log("Credenciais administrativas locais (guarde a senha):")

      console.log("Usuário: admin")

      console.log(`Senha: ${adminPassword}`)
    } catch (writeError) {
      if (writeError.code !== "EEXIST") throw writeError

      contents = await readFile(envFile, "utf8")
    }
  }

  const required = [
    "SAAL_DB_ROOT_PASSWORD",

    "SAAL_DB_RUNTIME_PASSWORD",

    "SAAL_DB_MIGRATION_PASSWORD",

    "SAAL_ADMIN_PASSWORD",
  ]

  const configured = new Set(
    contents

      .split(/\r?\n/)

      .map((line) => line.match(/^([A-Z0-9_]+)=.+$/)?.[1])

      .filter(Boolean),
  )

  const missing = required.filter((key) => !configured.has(key))

  if (missing.length > 0) {
    throw new Error(
      `backend/.env.dev não contém ${missing.join(", ")}. Preserve esse arquivo para manter o banco local.`,
    )
  }
}

async function waitForApi() {
  const url = "http://127.0.0.1:8080/api/v1/auth/session"

  const deadline = Date.now() + 120_000

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) })

      if (response.ok) return
    } catch {
      // The API can take a short time to start after the database becomes healthy.
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }

  runDocker(["logs", "--tail", "60", "api"])

  throw new Error("A API local não iniciou dentro do tempo esperado.")
}

async function start() {
  try {
    await access(viteCli)
  } catch (error) {
    if (error.code !== "ENOENT") throw error

    throw new Error(
      "Dependências do frontend ausentes. Execute pnpm install primeiro.",
    )
  }

  verifyDocker()
  await loadOrCreateLocalCredentials()

  runDocker(["up", "--detach", "--build"])

  try {
    await waitForApi()
  } catch (error) {
    runDocker(["down"])

    throw error
  }

  console.log("API local pronta. Abrindo http://localhost:8443/")

  const vite = spawn(
    process.execPath,

    [viteCli, "--host", "0.0.0.0", "--config", "vite.figma.config.ts"],

    {
      cwd: root,

      env: { ...process.env, SAAL_API_PROXY_TARGET: "http://127.0.0.1:8080" },

      stdio: "inherit",
    },
  )

  let stackStopped = false

  const stopStack = () => {
    if (stackStopped) return

    stackStopped = true

    runDocker(["down"])
  }

  const stop = () => {
    vite.kill("SIGINT")

    stopStack()
  }

  process.once("SIGINT", stop)

  process.once("SIGTERM", stop)

  vite.once("error", (error) => {
    console.error(`Não foi possível iniciar o Vite: ${error.message}`)

    stopStack()

    process.exitCode = 1
  })

  vite.once("exit", (code) => {
    stopStack()

    process.exitCode = code ?? 1
  })
}

try {
  if (process.argv.includes("--stop")) {
    runDocker(["down"])
  } else {
    await start()
  }
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Falha ao iniciar o ambiente local.",
  )

  process.exitCode = 1
}
