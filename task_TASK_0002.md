# TASK_0002 — SPEC

MODE: WRITE-ONCE (append only for updates)
ORIGIN: user
CREATED: 2026-01-07

---

## SPEC
Description:
- Expand Keeper from one-way forwarding to full chat hub with message receiving
- Integrate Discord Bot API for real-time message receiving and sending
- Store conversation history locally (SQLite)
- Maintain security best practices (token encryption, message sanitization)

Detailed Requirements:
- Discord Bot connects via Gateway WebSocket
- Receive DMs and mentions in real-time
- Display conversations in sidebar, messages in thread view
- User can select conversation, compose with AI assistance, send via API
- All Discord communication uses API (replaces OS automation for Discord)
- Token stored securely via Electron Safe Storage
- Messages persisted locally in SQLite

Research Foundation:
[ref:docs/CHAT_HUB_RESEARCH.md#RECOMMENDATIONS FOR LOOP 2|v:1|tags:research,security,arch|src:doc]

Assumptions (explicit):
- User has Discord account and can create a bot in Developer Portal
- Bot token will be provided by user via settings UI
- Privileged intents (DIRECT_MESSAGES) will be enabled in Discord Developer Portal
- SQLite for local persistence (better-sqlite3 library)
- OS automation remains as fallback for other platforms

Priority: 4
Estimated token cost: high

Refs:
- [ref:Seed.md#PROJECT_DESCRIPTION|v:1|tags:source|src:user]
- [ref:archive/ARCHIV_0001.md#FINAL|v:1|tags:context|src:system]
- [ref:docs/CHAT_HUB_RESEARCH.md#1. SECURITY RISKS & PREVENTION|v:1|tags:security|src:doc]
- [ref:docs/CHAT_HUB_RESEARCH.md#2. TECHNICAL CHALLENGES & REQUIREMENTS|v:1|tags:tech|src:doc]
- [ref:docs/CHAT_HUB_RESEARCH.md#3. DATA PERSISTENCE & LEARNING ARCHITECTURE|v:1|tags:data|src:doc]

---

## ACCEPTANCE
Done when:
- Discord bot connects and receives messages in Keeper UI
- User can view conversation list (sidebar) and message threads
- Compose → AI assistance → send works for Discord conversations via API
- Conversation history persists locally across app restarts
- Bot token stored securely (not in plain text)
- All message content sanitized before display
- Rate limiting implemented for outgoing messages
- OS automation still available for non-Discord platforms
- Core pointer-only structure maintained

---

END OF TASK
