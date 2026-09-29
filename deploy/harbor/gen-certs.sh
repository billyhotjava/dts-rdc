#!/usr/bin/env bash
# Internal CA + Harbor server certificate (IP SAN). The CA key never leaves this host.
# Validity starts BACKDATE_DAYS in the past so that hosts with clock skew (10.20.0.50 ran
# 8h ahead in 2026-09) do not see "certificate is not yet valid". Uses `openssl ca`
# because OpenSSL 1.1.1 (RHEL 8) cannot set a start date with `x509 -req`.
set -euo pipefail
cd "$(dirname "$0")"
HOST_IP="${HOST_IP:-10.20.0.50}"
HOST_DNS="${HOST_DNS:-harbor.dts.internal}"
BACKDATE_DAYS="${BACKDATE_DAYS:-2}"
FORCE_CA="${FORCE_CA:-0}"
START="$(date -u -d "-${BACKDATE_DAYS} days" +%Y%m%d%H%M%SZ)"

mkdir -p certs && cd certs
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
touch "$WORK/index.txt"
cat > "$WORK/ca.cnf" <<CNF
[ ca ]
default_ca = dts_ca
[ dts_ca ]
dir              = $WORK
database         = $WORK/index.txt
new_certs_dir    = $WORK
serial           = $WORK/serial
default_md       = sha256
policy           = policy_any
unique_subject   = no
copy_extensions  = none
[ policy_any ]
organizationName = optional
commonName       = supplied
[ v3_ca ]
basicConstraints       = critical,CA:TRUE
keyUsage               = critical,keyCertSign,cRLSign
subjectKeyIdentifier   = hash
[ v3_server ]
basicConstraints       = CA:FALSE
keyUsage               = critical,digitalSignature,keyEncipherment
extendedKeyUsage       = serverAuth
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid
subjectAltName         = IP:${HOST_IP},DNS:${HOST_DNS}
CNF
openssl rand -hex 16 > "$WORK/serial"

if [ ! -f ca.key ] || [ "$FORCE_CA" = "1" ]; then
  openssl genrsa -out ca.key 4096
  chmod 600 ca.key
  openssl req -new -key ca.key -subj "/O=Yuzhi DTS/CN=DTS Internal Root CA" -out "$WORK/ca.csr"
  openssl ca -batch -config "$WORK/ca.cnf" -selfsign -keyfile ca.key -in "$WORK/ca.csr" \
    -startdate "$START" -days 3650 -extensions v3_ca -notext -out ca.crt
fi

openssl genrsa -out server.key 2048
chmod 600 server.key
openssl req -new -key server.key -subj "/O=Yuzhi DTS/CN=${HOST_DNS}" -out "$WORK/server.csr"
openssl ca -batch -config "$WORK/ca.cnf" -cert ca.crt -keyfile ca.key -in "$WORK/server.csr" \
  -startdate "$START" -days 825 -extensions v3_server -notext -out server.crt
openssl verify -CAfile ca.crt server.crt
openssl x509 -in server.crt -noout -startdate -enddate -ext subjectAltName
