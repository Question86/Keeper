# TASK_0005

MODE: APPEND-ONLY

---

## SPEC

**Goal:**
Resolve ES Module build error blocking Discord integration and restore full app functionality.

**Detailed Requirements:**
- Investigate and fix ERR_REQUIRE_ESM error caused by discord.js → jsdom → html-encoding-sniffer → @exodus/bytes dependency chain
- Evaluate technical options:
  1. Migrate Electron main process to ES Module architecture
  2. Replace discord.js with ESM-compatible REST-only client
  3. Use @discordjs/rest + @discordjs/core packages (lighter weight)
  4. Downgrade discord.js to v13 (pre-ESM compatibility)
  5. Rebuild project with Electron Forge/Builder ESM templates
- Select most viable solution based on:
  - Implementation complexity and risk
  - Feature preservation (WebSocket Gateway for real-time chat monitoring)
  - Long-term maintainability (ESM is future of Node.js ecosystem)
  - Time to resolution
- Implement chosen solution
- Verify app starts without errors
- Verify IPC handlers register successfully
- Verify token storage works
- Verify Discord bot can connect with token

**Success Criteria:**
- App launches without ERR_REQUIRE_ESM error
- Electron main process loads successfully
- All IPC handlers registered (token:save/load/clear, discord:connect/disconnect/status/send, db:*, etc.)
- User can save Discord bot token in Settings
- User can test Discord connection successfully
- Ready for end-to-end testing in Loop 6

**Blocker from Loop 4:**
- B4.1: ES Module incompatibility in discord.js dependency chain prevents main process from loading

**User Note:**
- User also requested creating launch.bat file for easy app startup - defer to Loop 6 after successful testing

**Priority:**
10 (CRITICAL - blocks all Discord functionality)

---

END OF DOCUMENT
