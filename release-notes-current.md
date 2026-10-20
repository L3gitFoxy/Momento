# Momento v9.3.0
## Changelog
* Week apply only takes back XP for **today** — past weekdays (e.g. Tue–Sun when you apply on Monday) keep their XP
* Anti-dupe claim ledger for **crate keys only**: re-applying a week cannot re-roll keys for blocks already claimed that calendar day; if the whole day was key-claimed, extra blocks still grant no keys
* XP still awards normally after re-apply (clawback already handles XP)
* Key claim tracking is silent (no toasts / console noise)
# `HAPPY PLANNING`
