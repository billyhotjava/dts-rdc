#!/usr/bin/env python3
"""Check source and build boundaries without starting services or loading credentials."""
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = {"m": "http://maven.apache.org/POM/4.0.0"}
OWNERS = ("dts-common", "dts-studio", "dts-stack", "dts-app-stack", "dts-infra", "dts-wiki")
errors = []
checked = 0

def fail(path, message):
    errors.append(f"{path.relative_to(ROOT)}: {message}")

def sources(owner):
    for path in (ROOT / owner).rglob("*.java"):
        if "target" not in path.parts and "src/main/java" in path.as_posix():
            yield path

for owner in OWNERS:
    if not (ROOT / owner).is_dir():
        errors.append(f"{owner}: module missing; initialize the registered submodules")
        continue
    for path in sources(owner):
        checked += 1
        code = path.read_text(encoding="utf-8")
        imports = re.findall(r"^import\s+(?:static\s+)?([\w.]+)", code, re.M)
        for name in imports:
            if owner == "dts-common" and not name.startswith(("java.", "com.fasterxml.jackson.", "com.networknt.", "com.yuzhi.dts.common.")):
                fail(path, f"Common must remain framework-free; disallowed import {name}")
            if owner == "dts-studio" and name.startswith(("com.yuzhi.dts.copilot.analytics.", "com.yuzhi.dts.prs.", "com.yuzhi.dts.stack.")):
                fail(path, "Studio imports another service implementation")
            if owner == "dts-stack" and name.startswith(("com.yuzhi.dts.copilot.ai.", "com.yuzhi.dts.prs.", "com.yuzhi.dts.studio.")):
                fail(path, "Stack imports another service implementation")
            if owner == "dts-app-stack" and name.startswith(("com.yuzhi.dts.copilot.", "com.yuzhi.dts.studio.", "com.yuzhi.dts.stack.")):
                fail(path, "App imports a platform service implementation")
        if owner == "dts-stack" and re.search(r"\bcopilot_ai\s*\.", code):
            fail(path, "Stack accesses Studio's database schema")
    for pom in (ROOT / owner).rglob("pom.xml"):
        if "target" in pom.parts:
            continue
        checked += 1
        tree = ET.parse(pom)
        for dep in tree.findall("./m:dependencies/m:dependency", NS):
            group = dep.findtext("m:groupId", "", NS)
            artifact = dep.findtext("m:artifactId", "", NS)
            version = dep.findtext("m:version", "", NS)
            scope = dep.findtext("m:scope", "compile", NS)
            if owner == "dts-common" and scope != "test" and (group, artifact) not in {
                ("com.fasterxml.jackson.core", "jackson-databind"),
                ("com.fasterxml.jackson.dataformat", "jackson-dataformat-yaml"),
                ("com.networknt", "json-schema-validator"),
            }:
                fail(pom, f"Common dependency requires a boundary review: {group}:{artifact}")
            if artifact.startswith("dts-common") and (not version or "SNAPSHOT" in version or any(c in version for c in "[(),]")):
                fail(pom, "Shared contract dependency must use an explicit release version")
            if group == "com.yuzhi.dts" and scope != "test":
                allowed = artifact.startswith("dts-common") or (
                    owner == "dts-app-stack" and artifact.startswith("prs-")
                ) or (owner == "dts-studio" and artifact == "dts-copilot")
                if not allowed:
                    fail(pom, f"Runtime dependency crosses service boundary: {artifact}")
        for selector in (".//m:sourceDirectory", ".//m:testSourceDirectory", ".//m:resources/m:resource/m:directory"):
            for element in tree.findall(selector, NS):
                raw = (element.text or "").replace("${project.basedir}", str(pom.parent)).replace("${basedir}", str(pom.parent))
                if not raw or "${" in raw:
                    continue
                resolved = (pom.parent / raw).resolve()
                if not resolved.is_relative_to(ROOT / owner):
                    fail(pom, "Build imports source/resources from outside its module")
        parent = tree.find("m:parent", NS)
        if parent is not None:
            relative = parent.find("m:relativePath", NS)
            if relative is None or (relative.text or "").strip():
                path = (pom.parent / ("../pom.xml" if relative is None else relative.text)).resolve()
                if path.exists() and not path.is_relative_to(ROOT / owner):
                    fail(pom, "Maven parent comes from a sibling module")

resources = ROOT / "dts-stack/analytics/src/main/resources"
visited = set()
def check_changelog(path):
    if path in visited:
        return
    visited.add(path)
    if not path.is_file():
        fail(path, "Active Liquibase include is missing")
        return
    text = path.read_text(encoding="utf-8")
    if re.search(r"\bcopilot_ai\s*\.", text):
        fail(path, "Active Stack migration accesses Studio's database schema")
    tree = ET.fromstring(text)
    for element in tree:
        if element.tag.rsplit("}", 1)[-1] == "include":
            base = path.parent if element.get("relativeToChangelogFile", "false") == "true" else resources
            check_changelog((base / element.attrib["file"]).resolve())

check_changelog(resources / "config/liquibase/master.xml")

# Content layout (design D18-D23): documents live in dts-worklog/ and dts-docs/ only;
# dts-wiki stays product-neutral. Content itself is linted by dts-common/tools/content-lint.
for relative, message in (
    ("worklog", "Development records belong in dts-worklog/spaces/<slug>/worklog"),
    ("docs", "Product capability documents belong in dts-docs"),
    ("products", "Legacy static-wiki content; spaces are declared in dts-worklog/spaces.yml"),
    ("dts-wiki/content", "dts-wiki must not hold content"),
    ("dts-wiki/worklog", "dts-wiki must not hold content"),
):
    if (ROOT / relative).exists():
        errors.append(f"{relative}: {message}")
for app in sorted((ROOT / "dts-app-stack").glob("*/worklog")):
    errors.append(f"{app.relative_to(ROOT)}: App records belong in dts-worklog/spaces/<app>/worklog")
for required in ("dts-worklog/spaces.yml", "dts-docs/README.md"):
    if not (ROOT / required).is_file():
        errors.append(f"{required}: missing")

if errors:
    print("Boundary checks failed:\n" + "\n".join(errors), file=sys.stderr)
    sys.exit(1)
print(f"PASS: {checked} source/build files and {len(visited)} active Stack changelogs checked.")
print("Historical seeds not included by the active master are retained for migration evidence.")
