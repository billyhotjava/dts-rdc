#!/usr/bin/env bash
set -euo pipefail
module_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ $# -eq 0 ]]; then set -- verify; fi
exec "${MVN:-mvn}" -B -ntp -f "$module_dir/pom.xml" "$@"
