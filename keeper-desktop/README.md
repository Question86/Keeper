# Keeper Desktop

This directory contains the Electron desktop application for Keeper.

For full project documentation, setup instructions, and usage guide, see the [main README](../README.md) at the repository root.

---

## Quick Start

### Development Mode
```bash
npm install
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build

### Type Checking
```bash
npx tsc --noEmit
```

---

## Project Structure

```
keeper-desktop/
├── electron/           # Electron main process
│   ├── main.ts        # Entry point, window management
│   ├── database.ts    # SQLite persistence
│   ├── discord.ts     # Discord bot integration
│   ├── ollama.ts      # Ollama LLM integration
│   └── preload.ts     # IPC bridge (secure context)
├── src/               # React renderer process
│   ├── App.tsx        # Main React component
│   ├── components/    # UI components
│   │   ├── Compose.tsx
│   │   ├── Chat.tsx
│   │   ├── ReplyReShaper.tsx
│   │   └── Settings.tsx
│   └── types/         # TypeScript definitions
├── public/            # Static assets
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

---

## Technology Stack

- **Electron**: v30.0.1 - Desktop application framework
- **React**: v18.2.0 - UI library
- **TypeScript**: v5.2.2 - Type safety
- **Vite**: v5.1.6 - Build tool and dev server
- **discord.js**: v13.17.1 - Discord API integration
- **better-sqlite3**: v12.5.0 - Local database
- **Ollama**: Local LLM integration (external service)

---

## Key Features

### Main Process (Node.js/Electron)
- Database management via SQLite
- Discord bot connection and message handling
- Ollama API integration for LLM operations
- Secure token storage using Electron Safe Storage
- IPC handlers for renderer communication

### Renderer Process (React)
- **Compose Tab**: Draft and generate content with LLM
- **Chat Tab**: Browse Discord conversations, send messages
- **Reply Re-Shaper Tab**: Context-aware reply generation
- **Settings Tab**: Bot configuration and data management

### Security
- Context isolation enabled
- Preload script with constrained IPC API
- XSS protection via HTML escaping
- Encrypted token storage

---

## Development Notes

### ESM Compatibility
The project uses discord.js v13.17.1 (older version) to avoid ESM-related compatibility issues with Electron's CommonJS main process. Future upgrades to newer discord.js versions may require migration to full ESM support.

### Native Modules
`better-sqlite3` requires native compilation. If you encounter issues:

```bash
npx electron-rebuild
```

### Windows Development
On Windows, you can use the convenience launcher from the repository root:
```bash
..\launch.bat
```

---

For complete documentation, troubleshooting, and usage examples, see the [main README](../README.md).
