#!/usr/bin/env python3
"""Prepare a deterministic, history-preserving import in a NEW disposable clone.

Never changes the source repository or merges/pushes the destination repository.
Requires git-filter-repo 2.47.0 on PATH. Review manifest.json before importing refs.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess


EXCLUDED = {"dts-copilot-webapp", ".claude", ".superpowers", ".gitnexus", ".worktrees",
            "node_modules", "target", ".dev-logs", ".dev-pids", ".vscode"}
LEGACY = {"build.sh", "dev.sh", "start.sh", "smoke-test.sh", "docker-compose.yml",
          "docker-compose.dev.yml", "services", "scripts", "docker", "deploy"}


def target_path(path):
    """One mapping shared by history rewriting, overlays, and tree verification."""
    parts = path.split("/")
    if any(p in EXCLUDED or p == ".env" or p.startswith(".env.") for p in parts):
        return None
    if Path(path).suffix.lower() in {".key", ".pem", ".p12", ".jks"}:
        return None
    if parts[0] in {"dts-copilot-ai", "dts-copilot-analytics"}:
        return "engine/" + parts[0].replace("dts-copilot-", "engine-", 1) + "/" + "/".join(parts[1:])
    if parts[0] == "worklog":
        return "engine/worklog-history/" + "/".join(parts[1:])
    if parts[0] in LEGACY:
        return "engine/deploy/legacy/" + path
    return "engine/" + path


def git(repo, *args, binary=False):
    result = subprocess.check_output(["git", "-C", str(repo), *args])
    return result if binary else result.decode().strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--revision", required=True, help="Full frozen source HEAD SHA")
    parser.add_argument("--output", type=Path, required=True, help="Must not already exist")
    parser.add_argument("--overlay", action="append", default=[], help="Explicit changed file to preserve")
    args = parser.parse_args()
    source, output = args.source.resolve(), args.output.resolve()
    if output.exists() or output == source or source in output.parents:
        parser.error("output must be a new directory outside the source repository")
    if not shutil.which("git-filter-repo"):
        parser.error("git-filter-repo 2.47.0 must be available on PATH")
    source_sha = git(source, "rev-parse", "HEAD")
    if args.revision != source_sha:
        parser.error("source HEAD differs from the full frozen revision")
    for path in args.overlay:
        candidate = source / path
        if (Path(path).is_absolute() or ".." in Path(path).parts or candidate.is_symlink()
                or not candidate.is_file() or target_path(path) is None):
            parser.error(f"invalid overlay path: {path}")
    before = git(source, "status", "--porcelain=v1", "-z", binary=True)
    overlays = {path: (source / path).read_bytes() for path in args.overlay}
    branch = git(source, "branch", "--show-current")
    if not branch:
        parser.error("source must have a named branch")
    tags = git(source, "tag", "--merged", source_sha).splitlines()
    output.mkdir(parents=True)
    clone = output / "repo"
    subprocess.run(["git", "clone", "--quiet", "--no-local", "--single-branch", "--no-tags",
                    "--branch", branch, str(source), str(clone)], check=True)
    if git(clone, "rev-parse", "HEAD") != source_sha:
        raise RuntimeError("source changed while cloning")
    for tag in tags:
        git(clone, "fetch", "--quiet", "origin", f"refs/tags/{tag}:refs/tags/{tag}")
    # Execute the same mapping without importing this script's CLI in filter-repo.
    mapping = Path(__file__).read_text().split("def git(", 1)[0]
    callback = mapping + "\nreturn target_path(filename.decode()).encode() if target_path(filename.decode()) else None\n"
    subprocess.run(["git-filter-repo", "--filename-callback", callback,
                    "--tag-rename", ":copilot-"], cwd=clone, check=True)
    git(clone, "branch", "-m", "copilot-import")
    if set(git(clone, "tag", "--list").splitlines()) != {"copilot-" + t for t in tags}:
        raise RuntimeError("import tag set differs from reachable source tags")
    source_tree = git(source, "ls-tree", "-rz", source_sha, binary=True).split(b"\0")
    expected, excluded = {}, []
    for record in source_tree:
        if not record:
            continue
        metadata, raw_path = record.split(b"\t", 1)
        mode, kind, oid = metadata.decode().split()
        path = raw_path.decode()
        target = target_path(path)
        if target is None:
            excluded.append(path)
        else:
            if kind != "blob" or target in expected:
                raise RuntimeError(f"unsupported or colliding source entry: {path}")
            expected[target] = (mode, oid)
    actual = {}
    for record in git(clone, "ls-tree", "-rz", "HEAD", binary=True).split(b"\0"):
        if record:
            metadata, path = record.split(b"\t", 1)
            mode, _, oid = metadata.decode().split()
            actual[path.decode()] = (mode, oid)
    if actual != expected:
        raise RuntimeError("mapped tree differs from source blob IDs or modes")
    history_sha = git(clone, "rev-parse", "HEAD")
    for path, data in overlays.items():
        dest = clone / target_path(path)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        dest.chmod((source / path).stat().st_mode & 0o777)
        git(clone, "add", "--", target_path(path))
    if overlays:
        env = dict(os.environ)
        source_time = git(source, "show", "-s", "--format=%cI", source_sha)
        env.update(GIT_AUTHOR_DATE=source_time, GIT_COMMITTER_DATE=source_time)
        subprocess.run(["git", "-C", str(clone), "-c", "user.name=DTS migration",
                        "-c", "user.email=migration@localhost", "commit", "--quiet", "-m",
                        "chore(F1): preserve explicitly selected source worktree changes"], check=True, env=env)
    if (git(source, "rev-parse", "HEAD") != source_sha
            or git(source, "status", "--porcelain=v1", "-z", binary=True) != before
            or any((source / p).read_bytes() != data for p, data in overlays.items())):
        raise RuntimeError("source changed during preparation; discard this import and refreeze")
    manifest = {
        "source_sha": source_sha, "source_branch": branch,
        "source_commits": int(git(source, "rev-list", "--count", source_sha)),
        "history_sha": history_sha, "import_sha": git(clone, "rev-parse", "HEAD"),
        "tree_sha": git(clone, "rev-parse", "HEAD^{tree}"),
        "mapped_files": len(expected), "excluded_files": len(excluded),
        "tags": tags, "import_tags": git(clone, "tag", "--list").splitlines(),
        "overlays": {p: hashlib.sha256(data).hexdigest() for p, data in overlays.items()},
        "source_unchanged": True,
    }
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    (output / "excluded-paths.txt").write_text("\n".join(excluded) + "\n")
    shutil.copyfile(clone / ".git/filter-repo/commit-map", output / "commit-map.txt")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
