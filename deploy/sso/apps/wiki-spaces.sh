#!/usr/bin/env bash
# Ensures Keycloak access objects for every wiki product space (realm yuzhicloud):
#   client role  dts-wiki:space-<slug>   (checked by wiki-api / nginx for /p/<slug>/)
#   group        产品-<name>             (carries the role; add people here)
# Input on stdin, one product per line: "<slug>|<name>", e.g. generated from products.json:
#   node -e 'for (const p of require("./products.json").products) console.log(p.slug + "|" + p.name)' \
#     | ssh root@10.20.0.50 'cd /data/dts-sso && . ./.env && docker exec -i -e LC_ALL=C.UTF-8 \
#         -e KC_BOOTSTRAP_ADMIN_PASSWORD="$SSO_ADMIN_PASSWORD" dts-sso-keycloak bash /opt/keycloak/bootstrap/wiki-spaces.sh'
set -euo pipefail
export LC_ALL=C.UTF-8 LANG=C.UTF-8
K=/opt/keycloak/bin/kcadm.sh
R=yuzhicloud
$K config credentials --server http://localhost:8080 --realm master \
  --user "$KC_BOOTSTRAP_ADMIN_USERNAME" --password "$KC_BOOTSTRAP_ADMIN_PASSWORD" >/dev/null
WIKI=$($K get clients -r $R -q clientId=dts-wiki --fields id --format csv --noquotes | head -1)
gid() { $K get groups -r $R -q "search=$1" --fields id,name --format csv --noquotes | grep ",$1\$" | cut -d, -f1 | head -1; }

while IFS='|' read -r slug name; do
  [ -z "$slug" ] && continue
  role="space-$slug"; group="产品-$name"
  $K get "clients/$WIKI/roles/$role" -r $R >/dev/null 2>&1 \
    || { $K create "clients/$WIKI/roles" -r $R -s name="$role" -s "description=Wiki product space $name" >/dev/null; echo "role dts-wiki:$role created"; }
  [ -n "$(gid "$group")" ] || { $K create groups -r $R -s name="$group" >/dev/null; echo "group $group created"; }
  $K add-roles -r $R --gid "$(gid "$group")" --cclientid dts-wiki --rolename "$role" >/dev/null
  echo "ok  $group -> dts-wiki:$role"
done
