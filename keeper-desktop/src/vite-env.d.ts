/// <reference types="vite/client" />

declare global {
	interface Window {
		keeper: {
			dbTypes?: {
				// marker namespace (no runtime usage)
			}
			ollamaChat(req: {
				baseUrl?: string
				model: string
				system?: string
				prompt: string
				temperature?: number
			}): Promise<{ content: string }>
			writeClipboard(text: string): Promise<boolean>
			discordWebhookSend(args: { webhookUrl: string; content: string }): Promise<boolean>
			openExternal(url: string): Promise<boolean>
			osPasteSend(text: string): Promise<boolean>
			osFocusDiscordPasteSend(text: string): Promise<boolean>
			tokenSave(args: { platform: string; token: string }): Promise<boolean>
			tokenLoad(platform: string): Promise<string | null>
			tokenClear(platform: string): Promise<boolean>
			discordConnect(token: string): Promise<boolean>
			discordDisconnect(): Promise<boolean>
			discordStatus(): Promise<boolean>
			discordSend(args: { conversationId: string; content: string }): Promise<boolean>
			dbGetConversations(): Promise<{
				id: string
				platform: string
				display_name: string | null
				avatar_url: string | null
				last_message_at: number | null
				created_at: number
			}[]>
			dbGetMessages(conversationId: string): Promise<{
				id: string
				conversation_id: string
				direction: 'incoming' | 'outgoing'
				content: string
				timestamp: number
				platform_message_id: string | null
				author_name: string | null
			}[]>
			dbSaveSnippetUsage(usage: {
				snippet_id: string
				snippet_text: string
				input_text: string
				output_text: string
				final_text: string
				edit_distance: number
				user_rating?: number
				conversation_id?: string
			}): Promise<boolean>
			dbClearAll(): Promise<void>
		}
	}
}

export {}
