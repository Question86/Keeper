import { app, BrowserWindow, clipboard, ipcMain, shell, safeStorage } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { getDatabase, closeDatabase, getConversations, getMessages, saveSnippetUsage, clearAllData } from './database'
import { connectDiscord, disconnectDiscord, isDiscordConnected, sendDiscordMessage } from './discord'

const execAsync = promisify(exec)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

type OllamaChatRequest = {
  baseUrl?: string
  model: string
  system?: string
  prompt: string
  temperature?: number
}

type OllamaChatResponse = {
  content: string
}

// Token storage using safeStorage
const TOKEN_STORE_PATH = path.join(app.getPath('userData'), 'tokens.json')

function loadTokenStore(): Record<string, string> {
  if (!existsSync(TOKEN_STORE_PATH)) return {}
  try {
    return JSON.parse(readFileSync(TOKEN_STORE_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function saveTokenStore(tokens: Record<string, string>) {
  writeFileSync(TOKEN_STORE_PATH, JSON.stringify(tokens, null, 2), 'utf-8')
}

function registerIpcHandlers() {
  // Token management
  ipcMain.handle('token:save', async (_event, args: { platform: string; token: string }) => {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Encryption not available on this system')
    }

    const encrypted = safeStorage.encryptString(args.token)
    const tokens = loadTokenStore()
    tokens[args.platform] = encrypted.toString('base64')
    saveTokenStore(tokens)
    return true
  })

  ipcMain.handle('token:load', async (_event, platform: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
      return null
    }

    const tokens = loadTokenStore()
    const encryptedBase64 = tokens[platform]
    if (!encryptedBase64) return null

    try {
      const encrypted = Buffer.from(encryptedBase64, 'base64')
      return safeStorage.decryptString(encrypted)
    } catch (err) {
      console.error('Token decryption failed:', err)
      return null
    }
  })

  ipcMain.handle('token:clear', async (_event, platform: string) => {
    const tokens = loadTokenStore()
    delete tokens[platform]
    saveTokenStore(tokens)
    return true
  })

  // Discord Bot operations
  ipcMain.handle('discord:connect', async (_event, token: string) => {
    await connectDiscord(token)
    return true
  })

  ipcMain.handle('discord:disconnect', async () => {
    await disconnectDiscord()
    return true
  })

  ipcMain.handle('discord:status', () => {
    return isDiscordConnected()
  })

  ipcMain.handle('discord:send', async (_event, args: { conversationId: string; content: string }) => {
    await sendDiscordMessage(args.conversationId, args.content)
    return true
  })

  // Database operations
  ipcMain.handle('db:getConversations', () => {
    return getConversations()
  })

  ipcMain.handle('db:getMessages', (_event, conversationId: string) => {
    return getMessages(conversationId)
  })

  ipcMain.handle('db:saveSnippetUsage', (_event, usage: unknown) => {
    if (!usage || typeof usage !== 'object') throw new Error('Invalid snippet usage payload')
    const u = usage as Record<string, unknown>
    const snippet_id = typeof u.snippet_id === 'string' ? u.snippet_id : ''
    const snippet_text = typeof u.snippet_text === 'string' ? u.snippet_text : ''
    const input_text = typeof u.input_text === 'string' ? u.input_text : ''
    const output_text = typeof u.output_text === 'string' ? u.output_text : ''
    const final_text = typeof u.final_text === 'string' ? u.final_text : ''
    const edit_distance = typeof u.edit_distance === 'number' ? u.edit_distance : 0
    const user_rating = typeof u.user_rating === 'number' ? u.user_rating : undefined
    const conversation_id = typeof u.conversation_id === 'string' ? u.conversation_id : undefined

    if (!snippet_id || !snippet_text || !input_text || !output_text || !final_text) {
      throw new Error('Missing required snippet usage fields')
    }

    saveSnippetUsage({
      snippet_id,
      snippet_text,
      input_text,
      output_text,
      final_text,
      edit_distance,
      user_rating,
      conversation_id,
    })
    return true
  })

  ipcMain.handle('db:clearAll', () => {
    clearAllData()
    return true
  })

  ipcMain.handle('clipboard:writeText', (_event, text: unknown) => {
    clipboard.writeText(typeof text === 'string' ? text : '')
    return true
  })

  ipcMain.handle('shell:openExternal', async (_event, url: unknown) => {
    const value = typeof url === 'string' ? url.trim() : ''
    if (!value) throw new Error('Missing url')
    await shell.openExternal(value)
    return true
  })

  ipcMain.handle('discord:webhookSend', async (_event, args: { webhookUrl: string; content: string }) => {
    const webhookUrl = typeof args?.webhookUrl === 'string' ? args.webhookUrl.trim() : ''
    const content = typeof args?.content === 'string' ? args.content : ''
    if (!webhookUrl) throw new Error('Missing Discord webhook URL')
    if (!/^https:\/\//i.test(webhookUrl)) throw new Error('Discord webhook URL must be https://')
    if (!content.trim()) throw new Error('Nothing to send')

    // Discord webhook message limit is 2000 chars for `content`
    const payload = {
      content: content.length > 2000 ? content.slice(0, 2000) : content,
    }

    console.log('Sending to Discord webhook:', webhookUrl.substring(0, 50) + '...')

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('Discord webhook failed:', res.status, text)
      throw new Error(`Discord webhook error (${res.status}): ${text || res.statusText}`)
    }

    console.log('Discord webhook success')
    return true
  })

  ipcMain.handle('os:pasteSend', async (_event, text: unknown) => {
    const content = typeof text === 'string' ? text : ''
    if (!content.trim()) throw new Error('Nothing to send')

    // Copy to clipboard
    clipboard.writeText(content)

    // Wait briefly for clipboard to settle
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Use PowerShell with single quotes to avoid escaping issues
    const script =
      "Add-Type -AssemblyName System.Windows.Forms; " +
      "[System.Windows.Forms.SendKeys]::SendWait('^v'); " +
      "Start-Sleep -Milliseconds 100; " +
      "[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')"

    try {
      const { stderr } = await execAsync(`powershell -NoProfile -Command "${script}"`)
      if (stderr) {
        console.error('PowerShell stderr:', stderr)
      }
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('OS automation error:', msg, err)
      throw new Error(`OS automation failed: ${msg}`)
    }
  })

  ipcMain.handle('os:focusDiscordPasteSend', async (_event, text: unknown) => {
    const content = typeof text === 'string' ? text : ''
    if (!content.trim()) throw new Error('Nothing to send')

    if (process.platform !== 'win32') {
      throw new Error('focusDiscordPasteSend is only supported on Windows')
    }

    clipboard.writeText(content)
    await new Promise((resolve) => setTimeout(resolve, 150))

    const script =
      "Add-Type -AssemblyName System.Windows.Forms; " +
      "Add-Type @'\n" +
      "using System;\n" +
      "using System.Runtime.InteropServices;\n" +
      "public static class Win32 {\n" +
      "  [DllImport(\\\"user32.dll\\\")] public static extern bool SetForegroundWindow(IntPtr hWnd);\n" +
      "  [DllImport(\\\"user32.dll\\\")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);\n" +
      "}\n" +
      "'@; " +
      "$p = Get-Process Discord -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1; " +
      "if (-not $p) { throw 'Discord is not running (or no window). Open Discord Desktop first.' }; " +
      "[Win32]::ShowWindowAsync($p.MainWindowHandle, 9) | Out-Null; " +
      "[Win32]::SetForegroundWindow($p.MainWindowHandle) | Out-Null; " +
      "Start-Sleep -Milliseconds 120; " +
      "[System.Windows.Forms.SendKeys]::SendWait('^v'); " +
      "Start-Sleep -Milliseconds 100; " +
      "[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')"

    try {
      const { stderr } = await execAsync(`powershell -NoProfile -Command "${script}"`)
      if (stderr) {
        console.error('PowerShell stderr:', stderr)
      }
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('OS automation (Discord) error:', msg, err)
      throw new Error(`OS automation (Discord) failed: ${msg}`)
    }
  })

  ipcMain.handle('ollama:chat', async (_event, req: OllamaChatRequest): Promise<OllamaChatResponse> => {
    const baseUrl = (req.baseUrl?.trim() || 'http://localhost:11434').replace(/\/$/, '')
    const model = req.model?.trim()
    const prompt = req.prompt
    const system = req.system?.trim()

    if (!model) throw new Error('Missing model')
    if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('Missing prompt')

    const url = `${baseUrl}/api/chat`
    const body = {
      model,
      stream: false,
      options: typeof req.temperature === 'number' ? { temperature: req.temperature } : undefined,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Ollama error (${res.status}): ${text || res.statusText}`)
    }

    const data = (await res.json()) as { message?: { content?: string } }
    const content = data?.message?.content
    if (!content) throw new Error('Unexpected Ollama response')

    return { content }
  })
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 980,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase()
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  closeDatabase()
})

app.whenReady().then(() => {
  // Initialize database
  getDatabase()
  registerIpcHandlers()
  createWindow()
})
