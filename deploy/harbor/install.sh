#!/usr/bin/env bash
# Installs or reconfigures Harbor from the offline installer on this host.
# Images come from the offline bundle (docker load); no docker pull, no dockerd restart.
set -euo pipefail
cd "$(dirname "$0")"
export HARBOR_ROOT="${HARBOR_ROOT:-/data/harbor}"
export HARBOR_HOST="${HARBOR_HOST:-10.20.0.50}"
export HARBOR_HTTP_PORT="${HARBOR_HTTP_PORT:-18082}"
export HARBOR_HTTPS_PORT="${HARBOR_HTTPS_PORT:-18443}"
INSTALLER="${1:?usage: install.sh <harbor-offline-installer-vX.tgz>}"

./init-env.sh
set -a; . ./.env; set +a
[ -f certs/server.crt ] || ./gen-certs.sh

mkdir -p "$HARBOR_ROOT/installer" "$HARBOR_ROOT/data" "$HARBOR_ROOT/log"
tar xzf "$INSTALLER" -C "$HARBOR_ROOT/installer"
envsubst < harbor.yml.tmpl > harbor.yml
chmod 600 harbor.yml
cp harbor.yml "$HARBOR_ROOT/installer/harbor/harbor.yml"
cd "$HARBOR_ROOT/installer/harbor"
./install.sh
