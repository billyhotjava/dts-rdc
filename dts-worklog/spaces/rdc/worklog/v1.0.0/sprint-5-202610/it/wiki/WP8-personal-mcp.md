---
type: evidence
id: S5/Wiki/WP8-personal-mcp
covers: [S5/F3/T16, S5/F3/T14]
result: PARTIAL
title: Personal OAuth MCP and safe diagram bundles
date: 2026-10-06
status: IN_PROGRESS
---
# Personal OAuth MCP

Wiki commit: `d448e3d`; Infra commit: `9cda723` (after `bc65ebd`).

Fourteen focused backend cases passed: five real-security-chain MCP integration
cases, eight claim conversion cases and one sliding write-limit case. The
signature decoder was mocked; these cases do not prove a real Keycloak PKCE
login. Infra's three agent-registration and four manifest-role helper tests
passed offline with an isolated fake administrative adapter.

Checks cover personal audience/client/subject/scopes, anonymous and browser
session rejection, Origin/protocol/input validation, read/write tools, current
space authorization, native create/update attribution, stale-base conflicts,
Git read-only conflicts, diagram source/artifact authorization and sandbox
headers. The limiter permits 60 write attempts per subject per minute.

Review found and corrected two integration defects: Spring Security's automatic
protected-resource metadata needed the configured canonical Wiki URL; Jackson 2
JSON trees needed conversion to plain maps before Spring MVC's Jackson 3 response
serialization. The diagram source now returns the actual JSON fields.

The optional public agent client uses authorization code plus PKCE S256, no
password/implicit/service-account grants, personal roles and resource audience.
Registration is idempotent and does not assign user/group memberships.

Remaining runtime gates: actual callback URLs, a real personal PKCE token,
allowed/denied native/Git tool calls, and approved identity configuration. Diagram
reading UI and the build tool remain separate F3/T14 work.
