#!/usr/bin/env bash
# Poll -> build -> atomic publish loop for the DTS wiki.
#   /repo    persistent clone of dts-rdc (origin = GitHub over SSH)
#   /site    releases/<sha>/, current -> releases/<sha>, status.json
#   /cache   npm cache
#   /secrets deploy_key, known_hosts
# A failed fetch or build never touches the live release.
set -uo pipefail

GIT_URL="${GIT_URL:-git@github.com:billyhotjava/dts-rdc.git}"
BRANCH="${BRANCH:-main}"
INTERVAL="${INTERVAL:-120}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
REPO=/repo
SITE=/site
WORK=/tmp/wiki-src

export GIT_SSH_COMMAND="ssh -i /secrets/deploy_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/secrets/known_hosts -o ConnectTimeout=15"
export npm_config_cache=/cache/npm

log() { echo "[$(date -Iseconds)] $*"; }

write_status() { # state sha message
  local tmp="$SITE/status.json.tmp"
  printf '{"state":"%s","sha":"%s","message":"%s","time":"%s","live":"%s"}\n' \
    "$1" "$2" "${3//\"/\'}" "$(date -Iseconds)" "$(current_sha)" > "$tmp" && mv -f "$tmp" "$SITE/status.json"
}

current_sha() { basename "$(readlink "$SITE/current" 2>/dev/null)" 2>/dev/null || true; }

ensure_repo() {
  if [ -d "$REPO/.git" ]; then return 0; fi
  log "cloning $GIT_URL"
  git clone --branch "$BRANCH" --single-branch "$GIT_URL" "$REPO"
}

fetch() {
  git -C "$REPO" remote set-url origin "$GIT_URL"
  git -C "$REPO" fetch --quiet origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH"
}

build_release() { # sha
  local sha="$1" out="$SITE/releases/$1"
  rm -rf "$WORK" && mkdir -p "$WORK"
  git -C "$REPO" archive "$sha" docs worklog wiki | tar -x -C "$WORK" || return 1
  (
    cd "$WORK/wiki" &&
    npm ci --no-audit --no-fund --loglevel=error &&
    WIKI_BUILD_SHA="$sha" WIKI_BUILD_TIME="$(date '+%Y-%m-%d %H:%M')" npm run build --silent
  ) || return 1
  rm -rf "$out.tmp" && mkdir -p "$SITE/releases" && cp -a "$WORK/wiki/.vitepress/dist" "$out.tmp" && mv -T "$out.tmp" "$out"
  ln -sfn "releases/$sha" "$SITE/current.tmp" && mv -Tf "$SITE/current.tmp" "$SITE/current"
  # prune old releases, never the live one
  ls -1t "$SITE/releases" | grep -v -x "$sha" | tail -n +"$KEEP_RELEASES" | while read -r old; do rm -rf "$SITE/releases/$old"; done
}

cycle() {
  ensure_repo || { write_status error "" "clone failed"; return; }
  local fetch_msg="ok"
  fetch || fetch_msg="fetch failed (deploy key / network); building last fetched commit"
  local target
  target="$(git -C "$REPO" rev-parse "refs/remotes/origin/$BRANCH" 2>/dev/null || git -C "$REPO" rev-parse HEAD)"
  if [ "$target" = "$(current_sha)" ] && [ ! -f "$SITE/.rebuild" ]; then
    [ "$fetch_msg" = ok ] || write_status stale "$target" "$fetch_msg"
    return
  fi
  rm -f "$SITE/.rebuild"
  log "building $target"
  write_status building "$target" "$fetch_msg"
  if build_release "$target"; then
    log "published $target"
    write_status ok "$target" "$fetch_msg"
  else
    log "build failed for $target"
    write_status failed "$target" "build failed, live release unchanged"
  fi
}

mkdir -p "$SITE/releases" /cache/npm
while true; do
  cycle
  sleep "$INTERVAL"
done
