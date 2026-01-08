# TASK_0007

MODE: APPEND-ONLY

---

## SPEC

**Goal:**
Comprehensive testing, security hardening (XSS sanitization), and final polish of Keeper desktop app.

**Detailed Requirements:**
- Implement XSS sanitization in renderer for Discord message display (security gap from Loop 5)
- Test complete AI→Discord pipeline with real Discord interactions:
  - Send message from external Discord client to bot
  - Receive message in Chat view
  - Compose reply with AI remodulation
  - Send via bot API back to Discord
- Test all Compose mode features (Loop 1):
  - Ollama/Mistral AI remodulation
  - Forward to Discord webhook
  - Forward to Email (mailto)
  - Forward to OS automation (Battle.net/Discord DM paste+send)
- Test all compliance features (Loop 3):
  - Privacy & Data Policy disclosure visible
  - Consent checkbox requirement enforced
  - Clear All Data functionality
  - Rate limit error handling (simulate if needed)
- Bug fixes and UX improvements based on testing
- Documentation updates if needed

**Success Criteria:**
- XSS sanitization implemented and tested
- Complete pipeline tested end-to-end with real Discord messages
- All Compose mode features working
- All compliance features working
- No critical bugs remaining
- App ready for user deployment

**Previous Context:**
- Loop 5: Resolved ES Module build error (discord.js v13, removed isomorphic-dompurify)
- Loop 6: Fixed discord.js v13 API, Discord bot connected, AI→Discord pipeline implemented
- Security gap: XSS sanitization removed from main process, not yet in renderer

**Priority:**
8 (HIGH - security + testing before deployment)

---

## AMENDMENT (2026-01-08)

Scope changed by user request during Loop 7:
- Primary focus moved to UI/UX improvements and implementing the Reply Re-Shaper chatbox.
- Renderer-side XSS sanitization and comprehensive end-to-end testing are deferred to TASK_0008.


---

END OF DOCUMENT
