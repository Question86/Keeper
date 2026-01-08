import { saveConversation, saveMessage } from './database'

let client: import('discord.js').Client | null = null
let isConnected = false
let discordModule: typeof import('discord.js') | null = null

async function loadDiscordJS() {
  if (!discordModule) {
    discordModule = await import('discord.js')
  }
  return discordModule
}

export function getDiscordClient(): import('discord.js').Client | null {
  return client
}

export function isDiscordConnected(): boolean {
  return isConnected
}

export async function connectDiscord(token: string): Promise<void> {
  if (client) {
    await disconnectDiscord()
  }

  const discord = await loadDiscordJS()
  const { Client, Intents } = discord

  client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.MESSAGE_CONTENT,
    ],
  })

  client.on('ready', () => {
    console.log(`Discord bot logged in as ${client?.user?.tag}`)
    isConnected = true
  })

  client.on('messageCreate', async (message: import('discord.js').Message) => {
    // Ignore bot's own messages
    if (message.author.id === client?.user?.id) return

    try {
      // Store raw content - sanitization will happen in renderer when displaying
      const content = message.content

      const isDM = message.channel.type === 'DM'

      // Determine conversation ID
      const conversationId = isDM ? `discord-dm:${message.author.id}` : `discord-channel:${message.channel.id}`

      // Save conversation
      saveConversation({
        id: conversationId,
        platform: 'discord',
        display_name: isDM
          ? message.author.username
          : `#${'name' in message.channel && typeof message.channel.name === 'string' ? message.channel.name : 'unknown'}`,
        avatar_url: message.author.displayAvatarURL(),
        last_message_at: Math.floor(message.createdTimestamp / 1000),
      })

      // Save message
      saveMessage({
        id: `discord:${message.id}`,
        conversation_id: conversationId,
        direction: 'incoming',
        content: content,
        timestamp: Math.floor(message.createdTimestamp / 1000),
        platform_message_id: message.id,
        author_name: message.author.username,
      })

      // Notify renderer (via global event or window.webContents.send if needed)
      console.log(`New Discord message from ${message.author.username}: ${content.substring(0, 50)}...`)
    } catch (err) {
      console.error('Error processing Discord message:', err)
    }
  })

  client.on('error', (error: unknown) => {
    console.error('Discord client error:', error)
  })

  client.on('shardDisconnect', () => {
    console.log('Discord disconnected')
    isConnected = false
  })

  await client.login(token)
}

export async function disconnectDiscord(): Promise<void> {
  if (client) {
    await client.destroy()
    client = null
    isConnected = false
  }
}

export async function sendDiscordMessage(conversationId: string, content: string): Promise<void> {
  if (!client || !isConnected) {
    throw new Error('Discord bot not connected')
  }

  const match = conversationId.match(/^discord-(dm|channel):(.+)$/)
  if (!match) {
    throw new Error('Invalid Discord conversation ID')
  }

  const [, type, targetId] = match

  try {
    if (type === 'dm') {
      const user = await client.users.fetch(targetId)
      const dmChannel = await user.createDM()
      const sent = await dmChannel.send(content)

      // Save outgoing message
      saveMessage({
        id: `discord:${sent.id}`,
        conversation_id: conversationId,
        direction: 'outgoing',
        content,
        timestamp: Math.floor(sent.createdTimestamp / 1000),
        platform_message_id: sent.id,
        author_name: client.user?.username || 'Me',
      })
    } else if (type === 'channel') {
      const channel = await client.channels.fetch(targetId)
      if (!channel || typeof channel !== 'object') {
        throw new Error('Channel not found')
      }

      const send = (channel as unknown as Record<string, unknown>).send
      if (typeof send !== 'function') {
        throw new Error('Channel is not sendable')
      }

      const sentUnknown = await (send as (c: string) => Promise<unknown>)(content)
      const sent = sentUnknown as Record<string, unknown>
      const sentId = typeof sent.id === 'string' ? sent.id : null
      const createdTimestamp = typeof sent.createdTimestamp === 'number' ? sent.createdTimestamp : Date.now()
      if (!sentId) throw new Error('Unexpected Discord send result')

      // Save outgoing message
      saveMessage({
        id: `discord:${sentId}`,
        conversation_id: conversationId,
        direction: 'outgoing',
        content,
        timestamp: Math.floor(createdTimestamp / 1000),
        platform_message_id: sentId,
        author_name: client.user?.username || 'Me',
      })
    }
  } catch (error: unknown) {
    // Handle rate limit errors specifically
    if (error && typeof error === 'object') {
      const record = error as Record<string, unknown>
      const code = record.code
      const httpStatus = record.httpStatus

      if (code === 429 || httpStatus === 429) {
        const retryAfter = typeof record.retry_after === 'number' ? record.retry_after : 5
        throw new Error(`Rate limited. Please wait ${retryAfter} seconds before sending again.`)
      }

      if (typeof code === 'number' || typeof code === 'string') {
        const msg = typeof record.message === 'string' ? record.message : 'Unknown error'
        throw new Error(`Discord API error (${String(code)}): ${msg}`)
      }
    }

    throw error instanceof Error ? error : new Error(String(error))
  }
}
