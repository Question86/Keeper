import { ipcRenderer, contextBridge } from 'electron'

type DbConversation = {
  id: string
  platform: string
  display_name: string | null
  avatar_url: string | null
  last_message_at: number | null
  created_at: number
}

type DbMessage = {
  id: string
  conversation_id: string
  direction: 'incoming' | 'outgoing'
  content: string
  timestamp: number
  platform_message_id: string | null
  author_name: string | null
}

type SnippetUsage = {
  snippet_id: string
  snippet_text: string
  input_text: string
  output_text: string
  final_text: string
  edit_distance: number
  user_rating?: number
  conversation_id?: string
}

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('keeper', {
  ollamaChat(req: {
    baseUrl?: string
    model: string
    system?: string
    prompt: string
    temperature?: number
  }) {
    return ipcRenderer.invoke('ollama:chat', req) as Promise<{ content: string }>
  },
  writeClipboard(text: string) {
    return ipcRenderer.invoke('clipboard:writeText', text) as Promise<boolean>
  },
  discordWebhookSend(args: { webhookUrl: string; content: string }) {
    return ipcRenderer.invoke('discord:webhookSend', args) as Promise<boolean>
  },
  openExternal(url: string) {
    return ipcRenderer.invoke('shell:openExternal', url) as Promise<boolean>
  },
  osPasteSend(text: string) {
    return ipcRenderer.invoke('os:pasteSend', text) as Promise<boolean>
  },
  osFocusDiscordPasteSend(text: string) {
    return ipcRenderer.invoke('os:focusDiscordPasteSend', text) as Promise<boolean>
  },
  // Token management
  tokenSave(args: { platform: string; token: string }) {
    return ipcRenderer.invoke('token:save', args) as Promise<boolean>
  },
  tokenLoad(platform: string) {
    return ipcRenderer.invoke('token:load', platform) as Promise<string | null>
  },
  tokenClear(platform: string) {
    return ipcRenderer.invoke('token:clear', platform) as Promise<boolean>
  },
  // Discord
  discordConnect(token: string) {
    return ipcRenderer.invoke('discord:connect', token) as Promise<boolean>
  },
  discordDisconnect() {
    return ipcRenderer.invoke('discord:disconnect') as Promise<boolean>
  },
  discordStatus() {
    return ipcRenderer.invoke('discord:status') as Promise<boolean>
  },
  discordSend(args: { conversationId: string; content: string }) {
    return ipcRenderer.invoke('discord:send', args) as Promise<boolean>
  },
  // Database
  dbGetConversations() {
    return ipcRenderer.invoke('db:getConversations') as Promise<DbConversation[]>
  },
  dbGetMessages(conversationId: string) {
    return ipcRenderer.invoke('db:getMessages', conversationId) as Promise<DbMessage[]>
  },
  dbSaveSnippetUsage(usage: SnippetUsage) {
    return ipcRenderer.invoke('db:saveSnippetUsage', usage) as Promise<boolean>
  },
  dbClearAll() {
    return ipcRenderer.invoke('db:clearAll') as Promise<void>
  },
})
