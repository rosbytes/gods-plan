data "external_schema" "drizzle" {
  program = [
    "pnpm",
    "exec",
    "drizzle-kit",
    "export",
    "--config=drizzle-dev.config.ts"
  ]
}

env "local" {
  src = data.external_schema.drizzle.url
  dev = "docker://postgres/16/dev"
}