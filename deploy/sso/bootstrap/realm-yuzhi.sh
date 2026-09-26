#!/usr/bin/env bash
# Idempotent setup of realm "yuzhi" (internal staff SSO) via kcadm.
# Run inside the keycloak container:
#   docker exec -e WIKI_CLIENT_SECRET=... -e ADMIN_PASSWORD=... dts-sso-keycloak \
#     bash /opt/keycloak/bootstrap/realm-yuzhi.sh
# Env: KC_BOOTSTRAP_ADMIN_USERNAME/PASSWORD (from container), WIKI_CLIENT_SECRET,
#      FIRST_USER, FIRST_USER_EMAIL, FIRST_USER_PASSWORD (temporary, must change on login)
set -euo pipefail
KCADM=/opt/keycloak/bin/kcadm.sh
REALM=yuzhi
WIKI_URL=${WIKI_URL:-https://wiki.yuzhicloud.com}

$KCADM config credentials --server http://localhost:8080 --realm master \
  --user "$KC_BOOTSTRAP_ADMIN_USERNAME" --password "$KC_BOOTSTRAP_ADMIN_PASSWORD" >/dev/null

exists() { $KCADM get "$1" -r "$REALM" --fields id 2>/dev/null | grep -q '"id"'; }

if ! $KCADM get "realms/$REALM" >/dev/null 2>&1; then
  $KCADM create realms -s realm=$REALM -s enabled=true -s displayName="Yuzhi 研发" \
    -s internationalizationEnabled=true -s 'supportedLocales=["zh-CN","en"]' -s defaultLocale=zh-CN \
    -s loginWithEmailAllowed=true -s duplicateEmailsAllowed=false -s resetPasswordAllowed=true \
    -s bruteForceProtected=true -s ssoSessionIdleTimeout=28800 -s ssoSessionMaxLifespan=86400
  echo "realm $REALM created"
fi

for role in wiki-reader wiki-editor wiki-admin; do
  $KCADM get "roles/$role" -r $REALM >/dev/null 2>&1 || { $KCADM create roles -r $REALM -s name=$role >/dev/null; echo "role $role created"; }
done
# every realm user can read the wiki
$KCADM add-roles -r $REALM --rname "default-roles-$REALM" --rolename wiki-reader >/dev/null 2>&1 || true

CID=$($KCADM get clients -r $REALM -q clientId=dts-wiki --fields id --format csv --noquotes | head -1)
if [ -z "$CID" ]; then
  $KCADM create clients -r $REALM -s clientId=dts-wiki -s name="DTS Wiki" -s enabled=true \
    -s protocol=openid-connect -s publicClient=false -s standardFlowEnabled=true \
    -s directAccessGrantsEnabled=false -s "redirectUris=[\"$WIKI_URL/oauth2/callback\"]" \
    -s "webOrigins=[\"$WIKI_URL\"]" -s "attributes.\"post.logout.redirect.uris\"=$WIKI_URL/*" >/dev/null
  CID=$($KCADM get clients -r $REALM -q clientId=dts-wiki --fields id --format csv --noquotes | head -1)
  $KCADM create "clients/$CID/protocol-mappers/models" -r $REALM -s name=audience-dts-wiki \
    -s protocol=openid-connect -s protocolMapper=oidc-audience-mapper \
    -s 'config."included.client.audience"=dts-wiki' -s 'config."id.token.claim"=true' \
    -s 'config."access.token.claim"=true' >/dev/null
  echo "client dts-wiki created"
fi
[ -n "${WIKI_CLIENT_SECRET:-}" ] && $KCADM update "clients/$CID" -r $REALM -s "secret=$WIKI_CLIENT_SECRET"

if [ -n "${FIRST_USER:-}" ]; then
  UID_=$($KCADM get users -r $REALM -q username="$FIRST_USER" -q exact=true --fields id --format csv --noquotes | head -1)
  if [ -z "$UID_" ]; then
    $KCADM create users -r $REALM -s username="$FIRST_USER" -s email="${FIRST_USER_EMAIL:-}" \
      -s emailVerified=true -s enabled=true -s firstName="$FIRST_USER" >/dev/null
    $KCADM set-password -r $REALM --username "$FIRST_USER" --new-password "$FIRST_USER_PASSWORD" --temporary
    echo "user $FIRST_USER created (temporary password)"
  fi
  $KCADM add-roles -r $REALM --uusername "$FIRST_USER" --rolename wiki-editor --rolename wiki-admin
fi
echo "realm $REALM ready"
