# Keeper

**A local-first Discord chat hub with AI-assisted messaging**

Keeper is a desktop application that provides a unified Discord chat interface with local AI-powered message composition and reply reshaping. All data is stored locally, giving you complete control over your messages and interactions.

---

## Features

### 🎯 Core Capabilities
- **Discord Chat Hub**: Connect your Discord bot and manage conversations from a unified desktop interface
- **AI-Assisted Composition**: Draft messages with local LLM assistance (Ollama/Mistral)
- **Reply Re-Shaper**: Intelligently reshape replies based on context and intent
- **Local-First Design**: All data stored locally in SQLite - no cloud sync, no external servers
- **Privacy-Focused**: Encrypted token storage, full data control, Discord compliance built-in

### 🔧 Workflows

#### Compose
Draft → send prompt to Ollama → edit → forward/export
- Generate text content using local LLM
- Edit and refine outputs
- Export to clipboard or forward to destinations

#### Chat
Browse conversations → draft replies → optional AI remodulation → send via Discord bot
- View and manage Discord conversations locally
- Draft replies with optional AI assistance
- Send messages through connected Discord bot

#### Reply Re-Shaper
Input context + user intent → AI-shaped reply → copy/paste ready
- **Input A**: External message context (context-only)
- **Input B**: Your intent/draft (source of truth)
- **Output**: LLM-shaped reply ready to send
- Inline LLM behavior presets and custom instructions

---

## Architecture

### Technology Stack
- **Runtime**: Electron + React + TypeScript + Vite
- **UI Framework**: React 18 with TypeScript
- **Build Tool**: electron-vite
- **Database**: SQLite via better-sqlite3
- **Discord Integration**: discord.js v13.17.1
- **LLM Integration**: Ollama (local endpoint)
- **Security**: Electron contextIsolation with preload bridge

### Database Schema
```sql
conversations (id, platform, display_name, avatar_url, last_message_at)
messages (id, conversation_id, direction, content, timestamp, platform_message_id, author_name)
snippet_usage (snippet_id, input_text, output_text, final_text, edit_distance, user_rating, timestamp)
```

### Security Features
- **Context Isolation**: Constrained IPC API via `window.keeper`
- **Token Encryption**: Discord bot tokens stored using Electron Safe Storage
- **XSS Protection**: Renderer-side HTML escaping for external messages
- **Data Control**: "Clear All Data" capability for compliance

---

## Getting Started

### Prerequisites
- **Node.js** (npm workflows)
- **Ollama** running locally with a model available (e.g., `mistral`)
  - Install from: https://ollama.ai
  - Pull model: `ollama pull mistral`
- **Discord Bot Token** from Discord Developer Portal
  - Create bot at: https://discord.com/developers/applications
  - Enable required privileged intents (Message Content Intent, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Question86/Keeper.git
   cd Keeper
   ```

2. **Navigate to the app directory**
   ```bash
   cd keeper-desktop
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Build native modules** (if needed)
   ```bash
   npx electron-rebuild
   ```

### Running the Application

#### Option 1: Using the convenience launcher (Windows)
From the repository root:
```bash
launch.bat
```

#### Option 2: Direct npm command
From the `keeper-desktop` directory:
```bash
npm run dev
```

The application will launch in development mode with hot reload enabled.

### First-Time Setup

1. **Start Ollama** (if not already running)
   ```bash
   ollama serve
   ```

2. **Configure Discord Bot**
   - Open Keeper Settings
   - Enter your Discord bot token
   - Token will be encrypted and stored securely
   - Click "Connect" to establish bot connection

3. **Verify Setup**
   - Check that Ollama is accessible (default: `http://localhost:11434`)
   - Confirm Discord bot shows "Connected" status
   - Test message composition in the Compose tab

---

## Usage

### Composing Messages
1. Navigate to the **Compose** tab
2. Enter your prompt or draft text
3. Click "Generate" to invoke local LLM
4. Edit the generated output as needed
5. Use "Copy to Clipboard" or forward to desired destination

### Managing Discord Conversations
1. Navigate to the **Chat** tab
2. Browse your conversations from the sidebar
3. Select a conversation to view message history
4. Draft a reply in the message input field
5. Optionally click "Remodulate with Mistral" for AI assistance
6. Send via the connected Discord bot

### Using Reply Re-Shaper
1. Navigate to the **Reply Re-Shaper** tab
2. **Input A (Context)**: Paste the external message you're responding to
3. **Input B (Your Intent)**: Write your intended reply or talking points
4. Adjust LLM behavior preset if desired (or add custom instructions)
5. Click "Generate" to create the shaped reply
6. Copy the output and use it in your conversation

---

## Project Structure

```
Keeper/
├── keeper-desktop/          # Main Electron application
│   ├── electron/           # Electron main process code
│   │   ├── main.ts        # Main process entry point
│   │   ├── database.ts    # SQLite persistence layer
│   │   ├── discord.ts     # Discord bot integration
│   │   └── ollama.ts      # Ollama LLM integration
│   ├── src/               # React renderer process
│   │   ├── App.tsx        # Main application component
│   │   ├── components/    # UI components
│   │   └── types/         # TypeScript type definitions
│   ├── package.json       # Dependencies and scripts
│   └── vite.config.ts     # Vite configuration
├── docs/                   # Documentation
│   ├── PRIVACY.md         # Privacy policy
│   ├── DISCORD_COMPLIANCE_AUDIT.md
│   └── OPS_PROTOCOLS.md
├── report_TASK_0011_L11_v01.md  # Complete project report
└── README.md              # This file
```

---

## Development

### Available Scripts

In the `keeper-desktop` directory:

```bash
# Start development server with hot reload
npm run dev

# Build the application
npm run build

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Code Quality
- **Linting**: ESLint with TypeScript support
- **Type Checking**: Full TypeScript type coverage
- **Build Validation**: All checks pass in automated builds

---

## Known Limitations

### Current State
- **Interactive E2E Testing**: Full manual testing checklist exists but not yet fully executed/recorded
- **discord.js Version**: Using v13.17.1 (older version for ESM compatibility); future upgrade may require migration strategy
- **Windows Packaging**: May require elevated permissions for electron-builder signing

### Security Considerations
- External messages displayed via escaped rendering (XSS protection)
- Continued caution needed if future features render untrusted HTML
- Regular security audits recommended

---

## Privacy & Data

### Data Storage
- **All data stored locally** in SQLite database
- **No cloud synchronization**
- **No third-party servers**
- **No analytics or telemetry**

### Data Control
- View all data via the Chat interface
- Clear all data via Settings → "Clear All Data"
- Disconnect bot to stop new message collection
- Uninstall app for complete data removal

For complete details, see [docs/PRIVACY.md](docs/PRIVACY.md)

---

## Discord Compliance

Keeper complies with Discord Developer Guardrails:
- ✅ Uses official Discord Bot API (no user account automation)
- ✅ Data minimization (collects only necessary message data)
- ✅ User transparency (privacy policy and consent UI)
- ✅ Secure token storage (encrypted with OS keychain)
- ✅ Respects rate limits and API discipline

---

## Contributing

This project follows a structured development methodology documented in the reports (see `report_TASK_*` files). Key principles:

- **Report-First**: Non-trivial work requires dedicated report files
- **Loop Finality**: Each development loop produces exactly one archive
- **Immutability**: Archive files are final and never edited

For technical details and development history, see:
- [report_TASK_0011_L11_v01.md](report_TASK_0011_L11_v01.md) - Complete project report
- [PROJECT_TECH_BASELINE.md](PROJECT_TECH_BASELINE.md) - Technical baseline and system laws

---

## Roadmap

### Completed (Loops 1-10)
- ✅ MVP desktop app with Electron + React + TypeScript
- ✅ Discord bot integration with message send/receive
- ✅ Local LLM integration (Ollama/Mistral)
- ✅ SQLite persistence layer
- ✅ Reply Re-Shaper workflow
- ✅ Discord compliance guardrails
- ✅ XSS hardening for external messages
- ✅ Dark mode and readability improvements
- ✅ Type safety and linting

### Future Considerations
- Complete interactive E2E testing execution
- Discord.js upgrade strategy (ESM migration)
- Export functionality for conversations
- Individual conversation deletion
- Enhanced message formatting options

---

## License

See the repository for license information.

---

## Support

For questions, issues, or feature requests:
- Review source code for implementation details
- Check existing documentation in the `docs/` directory
- Audit key modules: `database.ts`, `discord.ts`, `ollama.ts`
- Review development reports for historical context

---

## Acknowledgments

Built with:
- [Electron](https://www.electronjs.org/) - Desktop application framework
- [React](https://react.dev/) - UI library
- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite database

---

**Project Status**: Active Development  
**Current Version**: Loop 11 (Full Documentation Complete)  
**Last Updated**: January 2026
