# Development and CI host preparation — 2026-10-04

Host: `10.20.0.6`; user: `devops`; checkout: `/opt/prod/dts/dts-rdc`.
The migrated baseline was RDC commit `89379d0` with clean initialized submodules.
The uninitialized metro-stack reference was preserved.

Installed Docker Engine 29.8.2, Compose 5.6.0, Buildx 0.37.1, Go 1.27.1 and
Temurin Java 25.0.4. Existing GraalVM Java 21.0.10, Maven 3.9.13 and Node 24.14.0
were retained. The Go archive was verified against the official release SHA-256.

User SSH and login profiles load a shared toolchain environment. Java 21 remains
the default; `dts-java25` selects Java 25. Default Go build parallelism is four.
Docker is enabled at boot and devops has Docker group access in fresh sessions.
Container logs have rotation limits. The required PostgreSQL 18.4 image is preloaded.

Direct GitHub/Docker Hub downloads encountered timeouts. JDK and Runner downloads
succeeded through the existing local proxy; PostgreSQL was downloaded from AWS
Public ECR's Docker library mirror. A separate boot-enabled `dts-ci-proxy.service`
listens on loopback 10818, using a private external configuration. GitHub API access
through this service returned HTTP 200. No credentials were added to the repository.

Validation:

- Repository boundaries: PASS (784 source/build files, 67 active Stack changelogs).
- Common clean install: PASS; 13 tests, no failures/errors/skips.
- Studio backend clean verify: PASS; 518 tests, no failures/errors/skips.
- Stack clean verify: PASS; 146 tests, no failures/errors/skips, including the live
  disposable PostgreSQL StackSchemaIsolationTest.
- PRS Pack CLI build: PASS; 31 assets, zero warnings.
- Java 25, Node, Go, Docker, Compose and Buildx version checks: PASS.
- Disposable Java integration-test containers were cleaned up.
- Infra `go test ./...`: PASS; all test packages completed successfully.

GitHub Actions Runner 2.337.0 was unpacked at `/opt/prod/ci/actions-runner`, checked
against the GitHub release API SHA-256, and its OS dependencies installed.
Toolchain and proxy environment files are prepared. Organization registration is
pending the user's exact GitHub organization URL and registration authorization;
no Runner service has been registered or started. Start with one Runner/job.

Operational instructions: `dts-infra/docs/development-ci-host.md`.
Build logs: `~/.local/state/dts-env/logs/`. No runtime product deployment was performed.
