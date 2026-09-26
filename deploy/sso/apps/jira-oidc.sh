#!/usr/bin/env bash
# Idempotently configures Jira (10.x Data Center) to use Keycloak realm "yuzhicloud" via OIDC.
# Run on 10.20.0.50:  JIRA_ADMIN='admin:<password>' bash jira-oidc.sh
# Keeps the username/password login form so the local "admin" account stays a break-glass login.
set -euo pipefail
: "${JIRA_ADMIN:?set JIRA_ADMIN=user:password}"
JIRA="${JIRA_URL:-http://localhost:18080}"
. /data/dts-sso/.env   # JIRA_CLIENT_SECRET

payload=$(cat <<JSON
{
  "name": "Yuzhicloud SSO",
  "sso-type": "OIDC",
  "enabled": true,
  "issuer-url": "https://sso.yuzhicloud.com/realms/yuzhicloud",
  "client-id": "jira",
  "client-secret": "$JIRA_CLIENT_SECRET",
  "username-claim": "\${preferred_username}",
  "additional-scopes": ["profile", "email"],
  "discovery-enabled": true,
  "buttonText": "使用 Yuzhicloud 统一账号登录",
  "enable-remember-me": true,
  "jit-configuration": { "user-provisioning-enabled": false }
}
JSON
)
# NOTE: username-claim is a template: "${preferred_username}", not the bare claim name.

id=$(curl -sf -u "$JIRA_ADMIN" "$JIRA/rest/authconfig/1.0/idps" | grep -o '"id":[0-9]*,"name":"Yuzhicloud SSO"' | grep -o '[0-9]*' | head -1 || true)
if [ -n "$id" ]; then
  curl -sf -u "$JIRA_ADMIN" -H 'Content-Type: application/json' -X PATCH --data "$payload" "$JIRA/rest/authconfig/1.0/idps/$id" >/dev/null
  echo "updated IdP $id"
else
  curl -sf -u "$JIRA_ADMIN" -H 'Content-Type: application/json' -X POST --data "$payload" "$JIRA/rest/authconfig/1.0/idps" >/dev/null
  echo "created IdP"
fi
curl -sf -u "$JIRA_ADMIN" -H 'Content-Type: application/json' -X PATCH \
  --data '{"show-login-form": true}' "$JIRA/rest/authconfig/1.0/sso" >/dev/null && echo "login form kept"
