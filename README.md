# DTS RDC

Research and development coordination for Decision Twins System. This checkout
contains independent product repositories, shared protocol artifacts, formal
product documents and development evidence. Current planning is maintained in
[October Sprint 5](worklog/v1.0.0/sprint-5-202610/README.md); earlier plans remain
historical inputs, not proof that their proposed services are implemented.

## Module ownership

| Module | Owns | Build boundary |
|---|---|---|
| [dts-common](dts-common/README.md) | Versioned Pack schemas, offline validation and CLI | Java 21 library/CLI; no service framework or database |
| [dts-studio](dts-studio/README.md) | AI agents, orchestration, Pack runtime | Java 21 / Spring Boot 3.4.5; Studio database |
| [dts-stack](dts-stack/README.md) | Data platform and imported analytics/BI baseline | Java 21 / Spring Boot 3.4.5; Stack database |
| [dts-app-stack](dts-app-stack/README.md) | Industry applications and their domain assets | Each App owns its build and database; PRS is the current integration case |
| [dts-infra](dts-infra/README.md) | Installer, orchestration, deployment and operations assets | Existing Go toolchain; not a dependency of application services |
| [dts-wiki](dts-wiki/README.md) | Project knowledge application | Independent Java/React application; replaces the retired root static Wiki |

`dts-common` is tracked in this coordination repository. Other product repositories
retain their existing Git submodule histories. Common is an optional release
artifact for consumers that need the Pack protocol; it is not a mandatory parent
or a shared business model for every module. PRS's `prs-common` remains local to PRS.

Applications communicate through authenticated APIs and versioned Pack contracts.
They must not import another service's implementation or read its internal database.
The analytics adapter still integrates with the existing Studio data-source API;
those optional integration operations fail when Studio is unavailable, while local
Stack functions remain separate. Full QueryGateway/identity/domain separation is
still pending; see the review evidence below.

## Local verification

Common must be installed once before building a separate Studio checkout:

```bash
# Java 21, Maven 3.9+, Python 3 and Docker on PATH.
./dts-common/build.sh clean install
python3 scripts/check-boundaries.py
# Preload the default postgres:18.4 image, or explicitly select another test image.
./dts-studio/build.sh verify
./dts-stack/build.sh verify
DTS_PACK_CLI="$PWD/dts-common/tools/pack-cli" \
  ./dts-app-stack/prs-stack/tools/build-studio-pack /tmp/new-prs.dtspack
```

Each product build works from its own checkout and consumes release artifacts or
API contracts. Build scripts do not compile sibling sources. PostgreSQL test
wrappers create disposable loopback-only databases and override inherited `PG_*`
settings. They do not use business databases or load `.env`.

Common 1.0.0 has been built and installed locally. Publishing it to a Maven registry
and configuring Studio CI's registry variables are separate delivery steps; no
remote publication or CI success is claimed. The root Common workflow produces
library/CLI artifacts for review. Toolchain versions in Wiki, PRS and Infra were
preserved, not upgraded during this cleanup.

## Repository navigation

- [Repository modularity review](worklog/v1.0.0/sprint-5-202610/assets/repository-modularity-review-20261002.md)
- [Sprint queue](worklog/v1.0.0/sprint-queue.md)
- [Worklog index](worklog/v1.0.0/README.md)
- [Planning reconciliation](worklog/v1.0.0/sprint-5-202610/assets/planning-reconciliation-20260926.md)
- [Contributor boundaries](AGENTS.md) and [project conventions](CLAUDE.md)

Human override, authenticated entry, authorized data, traceable operations and
API-first verification remain project requirements. Source/build checks do not
establish production deployment or authenticated business acceptance.

## License

Proprietary. All rights reserved.
