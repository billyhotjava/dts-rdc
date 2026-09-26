#!/usr/bin/env bash
# Idempotent setup of realm "yuzhicloud": the single internal-staff realm shared by all
# internal tools (one account, one login). Each tool is a client; permissions are client
# roles granted through groups.
#
#   docker exec -e LC_ALL=C.UTF-8 -e WIKI_CLIENT_SECRET=.. -e JIRA_CLIENT_SECRET=.. -e PORTAINER_CLIENT_SECRET=.. \
#     dts-sso-keycloak bash /opt/keycloak/bootstrap/realm-yuzhicloud.sh
# LC_ALL=C.UTF-8 is required: kcadm (Java) otherwise decodes the Chinese group names wrongly.
# The image has no awk; stick to grep/sed/cut.
#
# Migrates the earlier realm "yuzhi" (rename) and its realm-level wiki-* roles.
set -euo pipefail
export LC_ALL=C.UTF-8 LANG=C.UTF-8
KCADM=/opt/keycloak/bin/kcadm.sh
REALM=yuzhicloud
LEGACY_REALM=yuzhi

$KCADM config credentials --server http://localhost:8080 --realm master \
  --user "$KC_BOOTSTRAP_ADMIN_USERNAME" --password "$KC_BOOTSTRAP_ADMIN_PASSWORD" >/dev/null

realm_exists() { $KCADM get "realms/$1" --fields realm >/dev/null 2>&1; }
client_id() { $KCADM get clients -r $REALM -q "clientId=$1" --fields id --format csv --noquotes | head -1; }
group_id() { $KCADM get groups -r $REALM -q "search=$1" --fields id,name --format csv --noquotes | grep ",$1\$" | cut -d, -f1 | head -1; }
join_group() { # userId groupName
  local gid; gid=$(group_id "$2")
  $KCADM update "users/$1/groups/$gid" -r $REALM -s realm=$REALM -s userId="$1" -s groupId="$gid" -n
}

# ---- realm -------------------------------------------------------------------------------
if ! realm_exists $REALM; then
  if realm_exists $LEGACY_REALM; then
    $KCADM update "realms/$LEGACY_REALM" -s realm=$REALM
    echo "realm $LEGACY_REALM renamed to $REALM"
  else
    $KCADM create realms -s realm=$REALM -s enabled=true
    echo "realm $REALM created"
  fi
fi
$KCADM update "realms/$REALM" -s displayName="Yuzhicloud" \
  -s internationalizationEnabled=true -s 'supportedLocales=["zh-CN","en"]' -s defaultLocale=zh-CN \
  -s loginWithEmailAllowed=true -s duplicateEmailsAllowed=false -s resetPasswordAllowed=true \
  -s bruteForceProtected=true -s ssoSessionIdleTimeout=28800 -s ssoSessionMaxLifespan=86400

# ---- clients -----------------------------------------------------------------------------
ensure_client() { # clientId name redirectUri webOrigin secret
  local cid; cid=$(client_id "$1")
  if [ -z "$cid" ]; then
    $KCADM create clients -r $REALM -s clientId="$1" -s name="$2" -s enabled=true -s protocol=openid-connect \
      -s publicClient=false -s standardFlowEnabled=true -s directAccessGrantsEnabled=false >/dev/null
    cid=$(client_id "$1")
    echo "client $1 created"
  fi
  $KCADM update "clients/$cid" -r $REALM -s "redirectUris=[\"$3\"]" -s "webOrigins=[\"$4\"]" \
    -s "attributes.\"post.logout.redirect.uris\"=$4/*"
  if [ -n "$5" ]; then $KCADM update "clients/$cid" -r $REALM -s "secret=$5"; fi
  if ! $KCADM get "clients/$cid/protocol-mappers/models" -r $REALM --fields name | grep -q "audience-$1"; then
    $KCADM create "clients/$cid/protocol-mappers/models" -r $REALM -s name="audience-$1" \
      -s protocol=openid-connect -s protocolMapper=oidc-audience-mapper \
      -s "config.\"included.client.audience\"=$1" -s 'config."id.token.claim"=true' \
      -s 'config."access.token.claim"=true' >/dev/null
  fi
}
ensure_client dts-wiki  "DTS Wiki"  "https://wiki.yuzhicloud.com/oauth2/callback"              "https://wiki.yuzhicloud.com" "${WIKI_CLIENT_SECRET:-}"
ensure_client jira      "Jira"      "https://jira.yuzhicloud.com/plugins/servlet/oidc/callback" "https://jira.yuzhicloud.com" "${JIRA_CLIENT_SECRET:-}"
ensure_client portainer "Portainer" "https://10.20.0.50:19443/*"                                 "https://10.20.0.50:19443"    "${PORTAINER_CLIENT_SECRET:-}"

# ---- dts-wiki client roles ---------------------------------------------------------------
WIKI=$(client_id dts-wiki)
for role in reader editor admin; do
  $KCADM get "clients/$WIKI/roles/$role" -r $REALM >/dev/null 2>&1 \
    || { $KCADM create "clients/$WIKI/roles" -r $REALM -s name=$role >/dev/null; echo "role dts-wiki:$role created"; }
done
# every realm user can read the wiki. The default composite keeps its original name when a
# realm is renamed (e.g. default-roles-yuzhi), so read it from the realm instead of guessing.
DEFAULT_ROLE=$($KCADM get roles -r $REALM --fields name --format csv --noquotes | grep '^default-roles-' | head -1)
$KCADM add-roles -r $REALM --rname "$DEFAULT_ROLE" --cclientid dts-wiki --rolename reader >/dev/null

# ---- groups ------------------------------------------------------------------------------
for g in 管理员 研发部; do
  [ -n "$(group_id "$g")" ] || { $KCADM create groups -r $REALM -s name="$g" >/dev/null; echo "group $g created"; }
done
$KCADM add-roles -r $REALM --gid "$(group_id 研发部)" --cclientid dts-wiki --rolename editor >/dev/null
$KCADM add-roles -r $REALM --gid "$(group_id 管理员)" --cclientid dts-wiki --rolename editor --rolename admin >/dev/null

# ---- migrate legacy realm-level wiki-* roles to groups -----------------------------------
if $KCADM get roles/wiki-admin -r $REALM >/dev/null 2>&1; then
  admins=$($KCADM get roles/wiki-admin/users -r $REALM --fields id --format csv --noquotes)
  for uid in $admins; do join_group "$uid" 管理员; done
  for uid in $($KCADM get roles/wiki-editor/users -r $REALM --fields id --format csv --noquotes); do
    echo "$admins" | grep -qx "$uid" || join_group "$uid" 研发部
  done
  $KCADM remove-roles -r $REALM --rname "$DEFAULT_ROLE" --rolename wiki-reader >/dev/null 2>&1 || true
  for role in wiki-reader wiki-editor wiki-admin; do $KCADM delete "roles/$role" -r $REALM; done
  echo "legacy realm roles migrated to groups"
fi
echo "realm $REALM ready"
