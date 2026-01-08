# CHAT HUB INFRASTRUCTURE — RESEARCH

Research Date: 2026-01-07
Context: Planning Loop 2 expansion from MVP (one-way forwarding) to full chat hub with message receiving

---

## 1. SECURITY RISKS & PREVENTION

### Token Storage
**Risk:** Bot tokens are sensitive credentials. If leaked, attackers control your bot.

**Prevention:**
- **Electron Safe Storage API** (recommended): Uses OS keychain (Windows Credential Manager, macOS Keychain)
  - `safeStorage.encryptString(token)` → store encrypted blob
  - Decrypt on app start, keep in memory only
- **Never:** Hardcode tokens, commit to git, log in console
- **Env files:** Only for development; add to `.gitignore`

### Message Content Security
**Risk:** Displaying untrusted content from Discord/Telegram could enable XSS attacks.

**Prevention:**
- **Sanitize all incoming messages** before rendering (use DOMPurify or similar)
- **Electron contextIsolation: true** (already set) prevents renderer from accessing Node APIs
- **Content Security Policy (CSP):** Restrict inline scripts, external resources
- Treat all message content as untrusted user input

### Rate Limiting
**Risk:** Discord/Telegram will ban your bot if you send too many requests.

**Prevention:**
- **Discord:** ~50 requests/sec per bot, stricter for DMs (10/10 minutes to new users)
- **Telegram:** 30 messages/sec across all chats, 20/minute to same user
- Implement queue with rate limiter library (e.g., `bottleneck`)
- Show user warnings when approaching limits

### Log/Error Exposure
**Risk:** Logging full messages or tokens in dev mode.

**Prevention:**
- Redact tokens in error messages: `token.slice(0,8)+'...'`
- Don't log message content verbatim (log IDs only)
- Separate production vs dev logging levels

---

## 2. TECHNICAL CHALLENGES & REQUIREMENTS

### Discord Bot API

**Requirements:**
- **Gateway WebSocket:** Maintain persistent connection for real-time messages
- **Intents:** Request `GUILDS`, `GUILD_MESSAGES`, `DIRECT_MESSAGES` (privileged)
- **Privileged Intent Approval:** Need to enable in Discord Developer Portal once bot is verified (100+ servers)
- **Library:** Use `discord.js` (Node.js) - mature, well-documented
- **Reconnection:** Handle disconnects, resume sessions, backfill missed messages

**Challenges:**
- **DM Limitation:** Bot can only DM users who share a server with it
- **Message History:** Can fetch last 100 messages per channel (pagination for older)
- **Latency:** ~100-500ms for message delivery via Gateway
- **Offline:** If app closed, messages missed (need to fetch history on startup)

### Telegram Bot API

**Requirements:**
- **Polling or Webhook:** For localhost, use long-polling (no HTTPS needed)
- **Library:** Use `node-telegram-bot-api` or `telegraf`
- **Updates:** Poll `/getUpdates` endpoint every 1-3 seconds
- **No WebSocket:** REST API only, simpler than Discord

**Challenges:**
- **User Opt-In:** Users must send `/start` to your bot before it can message them
- **Message History:** Bots can't fetch old messages (only receive new ones)
- **Offline:** Telegram queues updates for 24 hours; you get them on next poll
- **No presence info:** Can't detect if user is online

### Local Run Considerations
- **No external server needed** (polling for both Discord and Telegram works from localhost)
- **Port conflicts:** None (Discord Gateway is outbound WS, Telegram is HTTP polling)
- **Firewall:** Only outbound connections needed
- **Multi-account:** Need separate bot tokens for each; manage in settings UI

---

## 3. DATA PERSISTENCE & LEARNING ARCHITECTURE

### Storage Approach

**Recommended: SQLite** (via `better-sqlite3` in Electron main process)

Schema:
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,        -- "discord:123456" or "telegram:789"
  platform TEXT NOT NULL,     -- "discord", "telegram", "battlenet-manual"
  display_name TEXT,
  last_message_at INTEGER
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  direction TEXT,              -- "incoming", "outgoing"
  content TEXT,
  timestamp INTEGER,
  platform_message_id TEXT,    -- original ID from Discord/Telegram
  FOREIGN KEY(conversation_id) REFERENCES conversations(id)
);

CREATE TABLE snippet_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snippet_id TEXT,             -- "neutral", "polite", "custom"
  snippet_text TEXT,           -- actual system prompt used
  input_text TEXT,             -- user's draft
  output_text TEXT,            -- AI response
  final_text TEXT,             -- after user edits
  edit_distance INTEGER,       -- Levenshtein distance (output → final)
  user_rating INTEGER,         -- optional 1-5 stars
  conversation_id TEXT,
  timestamp INTEGER,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id)
);
```

### Snippet Effectiveness Metrics

**Track per snippet:**
1. **Usage frequency** (how often selected)
2. **Edit ratio** = `edit_distance / output_length` (lower = better AI output)
3. **Time to send** (how long user takes to finalize)
4. **User rating** (optional explicit feedback)
5. **Context match** (which platforms/conversation types use which snippets most)

**Dashboard UI:**
- Show snippet leaderboard by edit ratio
- Highlight which snippets need refinement
- Export data as CSV for analysis

**Comparison to `bench.ps1` methodology:**
- Similar concept: measure prompt performance via quantifiable metrics
- Bench likely tests multiple prompts against same input, ranks by accuracy/quality
- Here: track real-world usage patterns over time instead of synthetic benchmarks

### Privacy
- **All data stays local** (SQLite file in user data dir)
- **No telemetry** unless user explicitly exports stats
- **User can purge data** via settings

---

## 4. OTHER RELEVANT TOPICS

### Platform-Specific Quirks

**Discord:**
- Markdown: `**bold**`, `*italic*`, `__underline__`, ` ```code``` `
- Embeds: Rich media (we'll just use plain text initially)
- Max message length: 2000 chars (split long messages)
- Edit message after send: possible via API

**Telegram:**
- HTML or Markdown (need to specify parse mode)
- Max message length: 4096 chars
- Edit message: possible within 48 hours
- Inline keyboards (buttons): could add quick snippet selection

**Battle.net / Universal:**
- No API, OS automation only
- Messages must be manually copied to Keeper (one-way receive)
- User responsibility to paste correctly

### File/Image Handling
**Scope for Loop 2:** Text-only (images ignored)
**Future:** Download attachments, let user view/forward them

### Bot Presence
- Discord: Set bot status ("Online", "Do Not Disturb", custom activity)
- Telegram: No presence (bots don't show online status)
- Show indicator in Keeper UI when bot is connected

### Testing Strategy
- **Dev bots:** Create separate test bots for Discord/Telegram
- **Test servers/chats:** Private Discord server, Telegram "Saved Messages"
- **Simulate messages:** Add debug UI to inject fake messages without API calls
- **Mock mode:** Toggle to test UI without real bot connections

---

## 5. METHODOLOGY WITHIN NEURAL CORTEX FRAMEWORK

### Loop 2 Scope (MVP for receiving messages)

**TASK_0002: Discord Bot Integration**
- Goal: Receive Discord messages in Keeper UI, send responses via API (no more OS automation)
- Acceptance:
  - Bot connects via Gateway, receives DMs and mentions
  - Messages display in conversation list
  - User can compose reply with AI assistance
  - Send button uses Discord API instead of paste/send
  - Conversation history persists locally (SQLite)

**TASK_0003: Telegram Bot Integration** (optional for Loop 2, or defer to Loop 3)
- Similar to TASK_0002 but for Telegram
- Acceptance: Same as Discord but via Telegram Bot API

**Out of scope for Loop 2:**
- Snippet analytics dashboard (defer to Loop 3+)
- Multi-account support (single bot per platform for now)
- File/image handling
- Battle.net receiving (remains manual/OS automation)
- Message search/filtering

### Loop 3+ Future Enhancements
- **Loop 3:** Snippet analytics, edit distance tracking, leaderboard
- **Loop 4:** Multi-account support, settings UI for tokens
- **Loop 5:** Steam Web API (send), Windows UIA for Battle.net (receive)
- **Loop 6:** Advanced features (message templates, scheduled sends, auto-responses)

### Incremental Development Strategy

**Step 1 (Loop 2 Start):**
- Create `task_TASK_0002.md` with Discord Bot spec
- Add Discord dependencies (`discord.js`, `better-sqlite3`)
- Implement token storage via Electron Safe Storage
- Build basic message schema (SQLite)

**Step 2:**
- Connect to Discord Gateway, handle `MESSAGE_CREATE` events
- Store incoming messages in DB
- Add conversation list UI (left sidebar)

**Step 3:**
- Add conversation view UI (message thread)
- Integrate compose → AI → send flow with active conversation
- Send message via Discord API instead of OS automation

**Step 4:**
- Test, fix bugs, update report
- Finalize Loop 2 archive

### Rollback Plan
If Discord integration breaks existing MVP:
- Keep current OS automation as fallback option in dropdown
- Discord destination only shows when bot is connected
- User can still use "Universal" for any platform

---

## RECOMMENDATIONS FOR LOOP 2

**Priority 1: Discord Bot (TASK_0002)**
- Highest value: most users have Discord, good API docs
- Manageable scope: can deliver in one loop

**Defer to Loop 3:**
- Telegram (less common, similar effort)
- Analytics dashboard (needs real usage data first)

**Security Checklist for Loop 2:**
- [ ] Implement Electron Safe Storage for tokens
- [ ] Add CSP to prevent XSS
- [ ] Sanitize all incoming message content
- [ ] Rate limit outgoing messages (queue)
- [ ] Never log tokens (redact in errors)
- [ ] Add settings UI to clear/reset token

**Technical Checklist:**
- [ ] Install `discord.js`, `better-sqlite3`
- [ ] Set up SQLite schema (conversations, messages, snippet_usage)
- [ ] Implement Gateway connection with reconnection logic
- [ ] Handle Discord intents (request DIRECT_MESSAGES)
- [ ] Build conversation list UI component
- [ ] Build message thread UI component
- [ ] Integrate with existing compose/AI/forward flow

---

END OF RESEARCH DOCUMENT
