# TASK_0001 — SPEC

MODE: WRITE-ONCE (append only for updates)
ORIGIN: user
CREATED: 2026-01-07

---

## SPEC
Description:
- Build an MVP that matches the Seed project description:
	- Local chat/compose window with an input box
	- A selectable instruction snippet (prompt prefix / system-style instruction)
	- Send combined prompt to a local Mistral LLM endpoint
	- Allow remodulation: (a) user edits the LLM output and/or (b) user requests another rewrite
	- Provide an agnostic “forward” mechanism for the finalized text (baseline: copy-to-clipboard)

Assumptions (explicit):
- Local Mistral is served via Ollama on the same machine (default: http://localhost:11434).
- Desktop runtime uses Electron (Node/Chromium) for Windows-first development.
- “Agnostic forwarding” initially means clipboard export; direct integrations (Discord/Telegram/etc) can be added later.
Priority: 5
Estimated token cost: medStatus: COMPLETED (2026-01-07)
Refs:
- [ref:Seed.md#PROJECT_DESCRIPTION|v:1|tags:source|src:user]

---

## ACCEPTANCE
Done when:
- A runnable MVP exists that can:
	- Compose text + select an instruction snippet
	- Send to local Mistral endpoint and display the response
	- Allow user edit of the response and export finalized text via clipboard
- Basic configuration exists for the local Mistral endpoint (URL/model).
- Core pointers remain pointer-only and continue to reference TASK_0001 + latest report.

---

END OF TASK
