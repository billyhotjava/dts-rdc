# DTS Common Pack Contracts

A small, framework-free contract artifact shared by the Studio Pack runtime and
App Pack producers, and (since 1.1.0) the `wiki-content` v1 contract shared by DTS
Wiki and its content repositories. It contains the existing manifest/asset/provenance JSON
schemas, the offline archive validator, its exception type and a deterministic
build/validation CLI. Industry ontologies, JDBC execution, persistence, registry
activation, authorization and deployment belong to the consuming modules.

## Artifacts

| Artifact | Consumer |
|---|---|
| `com.yuzhi.dts:dts-common-pack:1.0.0` | Java consumers of the validator or classpath schemas |
| `dts-common-pack-1.0.0-cli.jar` (classifier `cli`) | Pack producers in any language; no Studio process required |
| `src/main/resources/protocol/` | Versioned JSON schemas for other language consumers |
| `protocol/wiki-content/` | Space manifest (`spaces.yml`) and DTS-MD frontmatter schemas, v1 |
| `tools/content-lint` | Offline lint of a content repository (manifest, roots, frontmatter, sealed archives) |

Requires Java 21 and Maven 3.9+. Jackson and JSON Schema validation versions were
preserved from the existing Studio implementation. There is no Spring, JPA,
application configuration, database access, network call or service lifecycle.
Consumers do not need a Common Git submodule and are free to avoid this dependency.

```bash
./build.sh clean install
./tools/pack-cli validate /path/to/pack-source --strict
./tools/pack-cli build /path/to/pack-source -o /new/path/output.dtspack --strict
```

## Wiki content contract (wiki-content v1)

`content-lint check <repository-root> [--manifest dts-worklog/spaces.yml]` validates the
space manifest against `space-manifest.v1`, requires every root to be a directory owned
by exactly one space and every `spaces/<slug>/` directory to be declared, validates
frontmatter of known types (`sprint`, `feature`, `task`, `adr`, `evidence`, `page`)
using the same split rule as DTS Wiki, rejects duplicate document ids within a space
and symlinks, and verifies that each `spaces/<slug>/archive/<name>/` matches its sealed
checksum file `checksums/<slug>/<name>.sha256`. `content-lint seal <archive-directory>`
creates that file once; an existing seal is never overwritten.

```bash
./build.sh clean install
./tools/content-lint check /opt/prod/dts/dts-rdc
```

Version 1.1.0 adds this contract without changing the Pack schemas or APIs; consumers
pinned to 1.0.0 are unaffected.

The ordinary JAR preserves `/protocol/...` classpath resource names. The CLI JAR
includes its runtime libraries; `DTS_PACK_CLI_JAR` and `JAVA` can select a packaged
release and Java executable. The CLI performs offline validation and never starts
Studio. Tests cover manifest/schema compatibility, path safety, archive limits,
checksums, action confirmation requirements and deterministic builds.

## Independent consumption and releases

Studio depends on the pinned ordinary Maven artifact. PRS calls an explicitly
installed CLI through `DTS_PACK_CLI`, not a Studio build directory. Studio's legacy
CLI path is retained only as a launcher for the installed Common classifier JAR.

Version 1.0.0 is currently built/installed locally, not published remotely. The RDC
Common CI workflow verifies and uploads the artifacts; remote CI execution has not
been verified. For a Maven release, configure credentials outside this repository
under server ID `dts-releases`, then publish both attached artifacts using:

```bash
mvn -B -ntp clean deploy -DaltDeploymentRepository=dts-releases::https://your-registry/releases
```

Studio CI requires `DTS_MAVEN_REPOSITORY_URL` as a repository variable, and optional
`DTS_MAVEN_USERNAME`/`DTS_MAVEN_PASSWORD` secrets for a private registry. Its resolver
fetches only release 1.0.0. Breaking schema/API changes require an explicit new
contract version and coordinated consumer updates, never a snapshot or moving latest.
