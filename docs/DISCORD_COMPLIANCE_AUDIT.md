# Discord Compliance Audit — TASK_0003

MODE: READ
PURPOSE: Compliance Analysis
DATE: 2026-01-07

---

## AUDIT SCOPE
Review Keeper's Discord bot implementation against Discord Developer Guardrails (10 categories).

Codebase examined:
- [keeper-desktop/electron/discord.ts](keeper-desktop/electron/discord.ts) - Discord bot logic
- [keeper-desktop/electron/database.ts](keeper-desktop/electron/database.ts) - Data persistence
- [keeper-desktop/electron/main.ts](keeper-desktop/electron/main.ts) - Token storage
- [keeper-desktop/src/Settings.tsx](keeper-desktop/src/Settings.tsx) - User interface

---

## FINDINGS BY GUARDRAIL

### 1. Legal & Platform Compliance ✅ PASS
**Status**: COMPLIANT

Evidence:
- Bot operates via registered Discord application (user must provide token)
- No attempt to bypass Discord safeguards
- Implementation uses official discord.js library

**Actions**: None required

---

### 2. Bot Identity & Authentication ✅ PASS
**Status**: COMPLIANT

Evidence:
- Uses bot token exclusively (`connectDiscord(token)`)
- No user account automation (Line 16-27: `Client` with bot intents)
- Bot identifies itself via Discord's standard bot tagging

**Actions**: None required

---

### 3. Data Minimization & Privacy ⚠️ MEDIUM
**Status**: PARTIAL COMPLIANCE - Needs improvement

Findings:
- ✅ **GOOD**: Only stores message content, timestamps, author names
- ✅ **GOOD**: No analytics or hidden monitoring
- ⚠️ **CONCERN**: Logs ALL DMs and channel messages by default (discord.ts:36-73)
- ⚠️ **CONCERN**: No data retention policy defined
- ⚠️ **CONCERN**: No user-facing privacy disclosure

Evidence:
```typescript
// discord.ts:36 - Saves ALL messages without user consent or opt-in
client.on(Events.MessageCreate, async (message: Message) => {
  // ... automatically saves to database
  saveMessage({ ... })
})
```

**Severity**: MEDIUM
**Remediation**:
1. Add opt-in mechanism for message logging (per-conversation basis)
2. Document data retention policy (e.g., "Messages stored locally for 30 days")
3. Add privacy disclosure in Settings UI
4. Implement data deletion function

---

### 4. User Transparency ⚠️ HIGH
**Status**: NON-COMPLIANT - Requires action

Findings:
- ❌ **MISSING**: No disclosure of what data is collected
- ❌ **MISSING**: No information on data retention
- ❌ **MISSING**: No transparency about bot behavior
- ✅ **GOOD**: Settings UI shows bot token requirement

Evidence:
- Settings.tsx only shows connection instructions, no data policy
- No README or documentation about data handling
- Users unaware messages are being logged locally

**Severity**: HIGH
**Remediation**:
1. Add "Privacy & Data" section to Settings modal explaining:
   - What data is collected (messages, usernames, timestamps)
   - Where data is stored (local SQLite, not cloud)
   - How long data is retained
   - How to delete data
2. Add consent checkbox before first connection
3. Create user-facing privacy documentation

---

### 5. API & Rate Limit Discipline ⚠️ MEDIUM
**Status**: PARTIAL COMPLIANCE - Needs improvement

Findings:
- ✅ **GOOD**: Uses official discord.js (handles rate limits internally)
- ⚠️ **CONCERN**: No explicit rate limit handling in sendDiscordMessage
- ✅ **GOOD**: No scraping or mass operations
- ✅ **GOOD**: No mass-invite or automated outreach

Evidence:
```typescript
// discord.ts:96 - No error handling for rate limit exceptions
export async function sendDiscordMessage(conversationId: string, content: string): Promise<void> {
  // ... no try/catch for RateLimitError
}
```

**Severity**: MEDIUM
**Remediation**:
1. Add explicit rate limit error handling
2. Queue messages if rate limited
3. Display rate limit warnings to user

---

### 6. Abuse & Misuse Prevention ✅ PASS
**Status**: COMPLIANT

Evidence:
- ✅ DOMPurify sanitization prevents XSS (discord.ts:40)
- ✅ No spam or harassment features
- ✅ No ban evasion capabilities
- ✅ Bot ignores its own messages (discord.ts:37)

**Actions**: None required

---

### 7. Monetization Constraints ✅ PASS
**Status**: COMPLIANT (NOT APPLICABLE)

Evidence:
- No monetization features
- No user data selling
- No paywalls
- Open-source project (implicit from structure)

**Actions**: None required

---

### 8. Security & Token Handling ✅ PASS
**Status**: COMPLIANT

Evidence:
- ✅ Electron Safe Storage encryption (main.ts token storage)
- ✅ Token stored as encrypted base64 in tokens.json
- ✅ Password input field in Settings UI
- ✅ No token exposure in logs or errors

**Actions**: None required

---

### 9. Feature Scope Integrity ✅ PASS
**Status**: COMPLIANT

Evidence:
- ✅ Does not emulate Nitro features
- ✅ Does not replicate Discord's native systems
- ✅ Stays within declared scope (chat hub with AI remodulation)
- ✅ No unauthorized feature abuse

**Actions**: None required

---

### 10. Fallback Principle ✅ PASS
**Status**: COMPLIANT

Evidence:
- ✅ Least intrusive: only logs when bot is running
- ✅ Least persistent: local storage only (no cloud)
- ✅ Transparent: Settings UI shows connection status
- ✅ User control: can disconnect anytime

**Actions**: None required

---

## SUMMARY

### Compliance Score: 7/10 PASS | 2/10 PARTIAL | 1/10 NON-COMPLIANT

### Critical Findings: 0
### High Severity: 1
- **H1**: User Transparency - No data collection disclosure

### Medium Severity: 2
- **M1**: Data Minimization - No opt-in for message logging, no retention policy
- **M2**: Rate Limit Discipline - No explicit rate limit error handling

### Low Severity: 0

---

## RECOMMENDED ACTIONS (Priority Order)

### 1. HIGH PRIORITY - User Transparency (H1)
**Effort**: 2 hours
**Impact**: Prevents Discord enforcement action

Tasks:
- Add "Privacy & Data Policy" section to Settings.tsx
- Create docs/PRIVACY.md with data handling details
- Add consent checkbox on first Discord connection
- Display data retention info (suggest 30 days default)

### 2. MEDIUM PRIORITY - Data Minimization (M1)
**Effort**: 4 hours
**Impact**: Improves GDPR/privacy compliance

Tasks:
- Add per-conversation opt-in toggle for message logging
- Implement data retention policy (auto-delete after N days)
- Add "Clear All Data" button in Settings
- Update database.ts with deletion functions

### 3. MEDIUM PRIORITY - Rate Limit Handling (M2)
**Effort**: 2 hours
**Impact**: Prevents API abuse errors

Tasks:
- Wrap sendDiscordMessage in try/catch
- Handle RateLimitError specifically
- Queue messages and retry after rate limit expires
- Display user-friendly rate limit warning

---

## COMPLIANCE STATEMENT (For User)

> **Keeper Discord Bot - Data & Privacy**
>
> - **What we collect**: Message content, usernames, timestamps from Discord conversations you participate in
> - **Where it's stored**: Locally on your computer (SQLite database in app userData folder)
> - **How long**: Messages retained indefinitely (or specify retention period)
> - **Who sees it**: Only you - no cloud sync, no third parties
> - **Your control**: Disconnect bot anytime, clear data via Settings
> - **Discord compliance**: Operates via official Discord Bot API, respects rate limits, no user account automation

---

END OF AUDIT
