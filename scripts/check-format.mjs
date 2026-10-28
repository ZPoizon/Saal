import { spawnSync } from "node:child_process"

import { existsSync } from "node:fs"

import { resolve } from "node:path"

const runGit = (args) => {
  const result = spawnSync("git", args, { encoding: "utf8" })

  if (result.status !== 0) {
    process.stderr.write(result.stderr)

    process.exit(result.status ?? 1)
  }

  return result.stdout.trim().split(/\r?\n/).filter(Boolean)
}

const base = process.env.FORMAT_BASE

let changedFiles

if (base && !/^0+$/.test(base)) {
  changedFiles = runGit([
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    `${base}...HEAD`,
  ])
} else if (base) {
  changedFiles = runGit([
    "diff-tree",
    "--root",
    "--no-commit-id",
    "--name-only",
    "-r",
    "HEAD",
  ])
} else if (process.env.GITHUB_ACTIONS === "true") {
  changedFiles = runGit([
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    "HEAD^...HEAD",
  ])
} else {
  changedFiles = [
    ...runGit(["diff", "--name-only", "--diff-filter=ACMR", "HEAD"]),

    ...runGit(["ls-files", "--others", "--exclude-standard"]),
  ]
}

const formattableFiles = [...new Set(changedFiles)].filter((file) =>
  /\.(?:[cm]?[jt]sx?|jsonc?|css|scss|html)$/i.test(file),
)

if (formattableFiles.length === 0) {
  console.log("No changed source files supported by oxfmt.")

  process.exit(0)
}

const formatter = resolve("node_modules/oxfmt/bin/oxfmt")

if (!existsSync(formatter)) {
  console.error(
    "Local oxfmt executable was not found. Install dependencies before checking formatting.",
  )

  process.exit(1)
}

const result = spawnSync(
  process.execPath,
  [formatter, "--check", ...formattableFiles],
  {
    stdio: "inherit",
  },
)

process.exit(result.status ?? 1)
