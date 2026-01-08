# TASK_0006

MODE: APPEND-ONLY

---

## SPEC

**Goal:**
Complete end-to-end integration testing of Keeper desktop app with Discord bot connection (resuming TASK_0004 after ES Module blocker resolved).

**Detailed Requirements:**
- Test Discord bot connection in Settings with user's token
- Verify all compose mode features (Loop 1):
  - Ollama/Mistral AI remodulation
  - Forward to Discord webhook
  - Forward to Email (placeholder)
  - Forward to OS automation (PowerShell paste+send)
- Verify all chat mode features (Loop 2):
  - Conversation list display
  - Message thread display
  - Send Discord messages via bot API
  - Database persistence (SQLite)
- Verify all compliance features (Loop 3):
  - Privacy & Data Policy disclosure in Settings
  - Consent checkbox requirement
  - Clear All Data functionality
  - Rate limit error handling
- Implement XSS sanitization in renderer for Discord message display
- Document all test results with pass/fail status
- Create launch.bat file for easy app startup (deferred from Loop 4)

**Success Criteria:**
- Discord bot connects successfully with user's token
- All compose mode features working as expected
- All chat mode features working as expected
- All compliance features working as expected
- XSS protection implemented in renderer
- launch.bat created and functional
- Test report with comprehensive results

**Previous Context:**
- TASK_0004 blocked by ES Module build error
- TASK_0005 resolved build error (discord.js v13, removed isomorphic-dompurify, electron-rebuild)
- User provided bot token: [REDACTED]

**Priority:**
10 (CRITICAL - unblocked, ready for testing)

---

END OF DOCUMENT
