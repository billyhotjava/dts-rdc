#!/usr/bin/env bash
# Creates .env with random secrets if it does not exist yet.
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] && { echo ".env exists, keeping it"; exit 0; }
rand() { openssl rand -base64 24 | tr -d '/+=' | cut -c1-24; }
cat > .env <<ENV
SSO_DB_PASSWORD=$(rand)
SSO_ADMIN_USER=admin
SSO_ADMIN_PASSWORD=$(rand)
ENV
chmod 600 .env
echo "created .env"
