# TASK_0004 — End-to-End Integration Testing

MODE: READ
SOURCE: user
LOOP ASSIGNED: 4

---

## SPEC

### Goal
Validate Keeper's full integration flow with real Discord bot token through comprehensive end-to-end testing across all features (Loop 1 + Loop 2 + Loop 3).

### Context
[ref:Seed.md#PROJECT_DESCRIPTION|v:1|tags:source|src:user]
[ref:archive/ARCHIV_0003.md#FINAL|v:1|tags:previous|src:system]
[ref:docs/PRIVACY.md|v:1|tags:compliance|src:doc]

All major features implemented:
- Loop 1: MVP with Ollama/Mistral remodulation + OS automation forwarding
- Loop 2: Discord Bot API with conversation/message persistence
- Loop 3: Compliance fixes (privacy disclosure, data deletion, rate limits)

### Success Criteria
**Compose Mode (Loop 1)**:
- Draft → Mistral → Remodulated output works
- Forward via Discord webhook succeeds
- Forward via Email (mailto) opens mail client
- Forward via OS paste/send (Battle.net/Discord DM) works with countdown

**Chat Mode (Loop 2)**:
- Discord bot connects with valid token
- Conversation list shows DMs and channels
- Message thread displays incoming messages
- Sending message via Discord API succeeds
- Database persistence verified (messages survive app restart)

**Compliance (Loop 3)**:
- Settings shows Privacy & Data Policy
- Consent checkbox blocks connection without acceptance
- Clear All Data deletes conversations/messages
- Rate limit errors display user-friendly messages

### Constraints
- Must not break existing functionality
- Must preserve NEURAL_CORTEX framework compliance
- Must follow PROJECT_TECH_BASELINE laws
- Requires user's actual Discord bot token (provided at runtime)

### Dependencies
- Loops 1, 2, 3 completed
- Ollama with Mistral model running locally
- User's Discord bot created at Discord Developer Portal
- Discord bot token with privileged MESSAGE_CONTENT intent

---

## ACCEPTANCE
Work complete when:
1. All compose mode features tested and working
2. All chat mode features tested and working
3. All compliance features tested and working
4. Test report documents results with screenshots/logs
5. Bugs identified and prioritized (CRITICAL/HIGH/MEDIUM/LOW)
6. Report updated to COMPLETED or BLOCKED (if critical bugs found)
7. Archive finalized with outcome summary

---

END OF DOCUMENT
