# TASK_0009

MODE: APPEND-ONLY

---

## SPEC

**Goal:**
Complete end-to-end verification of Keeper’s core workflows and fix any critical issues found.

**Detailed Requirements:**
- End-to-end testing of the core pipeline(s):
  - Chat: external Discord message → visible in Chat view → (optional) copy to Reply Re-Shaper → reshape using local LLM → send reply via bot.
  - Compose: draft → remodulate (Ollama) → forward to each destination (Discord webhook, Email mailto, OS paste/send).
- Validate UI correctness for the reworked Reply Re-Shaper view:
  - All 3 text areas visible
  - LLM behaviour settings visible (preset + custom instruction)
- Fix any critical bugs found during testing (focus: correctness + stability).
- Update the report with an explicit pass/fail checklist and outcomes.

**Success Criteria:**
- Core workflows verified end-to-end without critical errors.
- No critical crashes, hangs, or broken IPC paths during daily-use flows.
- App behavior is predictable and usable for daily operation.

**Previous Context:**
- Loop 8 implemented renderer-side external message escaping and reworked Reply Re-Shaper UI; end-to-end workflow testing was deferred here.

**Priority:**
9 (HIGH)

---

## AMENDMENT (2026-01-08)

Scope adjustment for Loop 9 close-out:
- Completed automated smoke checks (lint + TypeScript typecheck) and fixed issues found.
- Full interactive end-to-end verification is deferred to a future testing loop (TASK_0011).


END OF DOCUMENT
