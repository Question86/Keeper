# Privacy & Data Policy — Keeper

Last Updated: 2026-01-07

---

## Overview

Keeper is a desktop application that integrates with Discord to provide a unified chat interface with AI-powered message remodulation. This document explains how Keeper handles your data.

---

## What Data We Collect

### Discord Integration
When you connect a Discord bot:
- **Message content** from conversations you participate in
- **Usernames and display names** of message authors
- **Message timestamps** (when messages were sent)
- **Channel/conversation identifiers** (to organize messages)
- **User avatar URLs** (for display purposes only)

### AI Remodulation (Local)
- **Draft text** you compose
- **Remodulated output** from local Mistral model
- **Instruction snippets** you select
- **Edit distance metrics** (to measure snippet effectiveness)

---

## Where Data Is Stored

### Local Storage Only
- All data stored in **SQLite database** on your computer
- Location: Application userData folder (OS-managed)
- **No cloud synchronization**
- **No third-party servers**
- **No remote backups**

### Encryption
- Discord bot token encrypted via **Electron Safe Storage** (OS keychain)
- Stored as encrypted base64 in `tokens.json`
- Message content stored unencrypted in local database (for searchability)

---

## How Long Data Is Retained

### Default Retention
- **Messages**: Retained indefinitely until manually deleted
- **Conversations**: Remain until manually deleted
- **Tokens**: Remain until cleared or app uninstalled
- **Snippet usage analytics**: Retained indefinitely

### User Control
- Clear individual conversations (feature pending)
- Clear all data via Settings → "Clear All Data"
- Disconnect bot to stop new message collection
- Uninstall app to remove all data

---

## Who Can Access Your Data

### You Only
- Data stored locally on your device
- No remote access by developers or third parties
- No analytics or telemetry sent to external services

### Discord Access
- Discord platform can see bot activity (messages sent/received)
- Governed by Discord's Terms of Service and Privacy Policy
- Bot operates via official Discord API

---

## Discord Compliance

Keeper complies with Discord Developer Guardrails:

### Legal & Platform Compliance
- Uses official Discord Bot API
- No user account automation (self-bots prohibited)
- No attempt to bypass Discord safeguards

### Data Minimization
- Collects only message content, usernames, timestamps
- No hidden analytics or monitoring
- No DM archiving without user awareness

### User Transparency
- This privacy policy discloses data practices
- Consent required before connecting Discord bot
- Clear data deletion capability provided

### Security
- Bot tokens encrypted with OS-provided security
- No token exposure in logs or error messages
- Immediate disconnect on token compromise

### API Discipline
- Respects Discord rate limits
- No scraping or mass operations
- No automated outreach or spam

---

## Your Rights & Controls

### Access
- View all stored data via Chat interface
- Database file accessible in app userData folder

### Deletion
- **Clear All Data**: Settings → Privacy & Data Policy → Clear All Data
- **Disconnect Bot**: Settings → Disconnect (stops new data collection)
- **Uninstall**: Complete data removal

### Export
- Database file: SQLite format (can be exported with SQLite tools)
- No built-in export feature (pending)

---

## Changes to This Policy

- Policy updates posted in this document
- Major changes require new consent in Settings
- Check this file for latest version

---

## Contact & Questions

Keeper is an open-source project. For questions or concerns:
- Review source code at repository location
- Open issues for privacy-related concerns
- Audit database.ts and discord.ts for data handling logic

---

## Technical Details

### Database Schema
```sql
conversations (id, platform, display_name, avatar_url, last_message_at)
messages (id, conversation_id, direction, content, timestamp, platform_message_id, author_name)
snippet_usage (snippet_id, input_text, output_text, final_text, edit_distance, user_rating, timestamp)
```

### Data Flow
1. Discord bot receives message → sanitized with DOMPurify
2. Saved to local SQLite database
3. Displayed in Chat view
4. No external transmission

### Dependencies
- discord.js: Official Discord library
- better-sqlite3: Local database engine
- isomorphic-dompurify: XSS prevention

---

END OF POLICY
