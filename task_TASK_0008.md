# TASK_0008

MODE: APPEND-ONLY

---

## SPEC

**Goal:**
Complete the deferred security + testing work to make Keeper ready for reliable daily use.

**Detailed Requirements:**
- Implement XSS sanitization in renderer for displaying external messages (Discord message content and any other externally sourced text rendered in the UI).
- End-to-end testing of the core pipeline(s):
  - Chat: external Discord message → visible in Chat view → (optional) copy to Reply Re-Shaper → reshape using local LLM → send reply via bot.
  - Compose: draft → remodulate (Ollama) → forward to each destination (Discord webhook, Email mailto, OS paste/send).
- Fix any critical bugs found during testing (focus: correctness + stability).

**Success Criteria:**
- External message rendering is sanitized (no script injection via message content).
- Core workflows verified end-to-end without critical errors.
- App behavior is predictable and usable for daily operation.

**Priority:**
8 (HIGH)

---

## AMENDMENT (2026-01-08)

Scope adjustment for Loop 8 close-out:
- Implemented renderer-side external message escaping (XSS hardening) and performed UI rework of Reply Re-Shaper.
- Comprehensive end-to-end workflow testing is deferred to TASK_0009.


END OF DOCUMENT
