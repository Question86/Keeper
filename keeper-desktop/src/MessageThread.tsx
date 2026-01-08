import { useCallback, useEffect, useState, useRef } from 'react'
import './MessageThread.css'
import { toSafeMultilineHtml } from './sanitize'

interface Message {
	id: string
	conversation_id: string
	direction: 'incoming' | 'outgoing'
	content: string
	timestamp: number
	platform_message_id: string | null
	author_name: string | null
}

interface MessageThreadProps {
	conversationId: string
	conversationName: string
	onSendMessage: (content: string) => void
	ollamaBaseUrl: string
	ollamaModel: string
	onCopyToReshaper?: (message: string) => void
}

export default function MessageThread({ conversationId, conversationName, onSendMessage, ollamaBaseUrl, ollamaModel, onCopyToReshaper }: MessageThreadProps) {
	const [messages, setMessages] = useState<Message[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [messageInput, setMessageInput] = useState('')
	const [isRemodulating, setIsRemodulating] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const loadMessages = useCallback(async () => {
		try {
			const msgs = await window.keeper.dbGetMessages(conversationId)
			setMessages(msgs)
		} catch (err) {
			console.error('Failed to load messages:', err)
		} finally {
			setIsLoading(false)
		}
	}, [conversationId])

	useEffect(() => {
		loadMessages()
		// Refresh every 3 seconds to catch new messages
		const interval = setInterval(loadMessages, 3000)
		return () => clearInterval(interval)
	}, [loadMessages])

	useEffect(() => {
		// Scroll to bottom when messages change
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	async function handleRemodulate() {
		if (!messageInput.trim()) return
		
		setIsRemodulating(true)
		try {
			const result = await window.keeper.ollamaChat({
				baseUrl: ollamaBaseUrl,
				model: ollamaModel,
				system: 'Rewrite the text for clarity and correct grammar. Keep meaning and tone.',
				prompt: messageInput
			})
			setMessageInput(result.content)
		} catch (err) {
			console.error('Remodulation failed:', err)
			alert('Remodulation failed: ' + (err instanceof Error ? err.message : String(err)))
		} finally {
			setIsRemodulating(false)
		}
	}

	function handleSend() {
		if (!messageInput.trim()) return
		
		onSendMessage(messageInput)
		setMessageInput('')
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
			e.preventDefault()
			handleSend()
		} else if (e.key === 'Enter' && e.ctrlKey) {
			e.preventDefault()
			handleSend()
		} else if (e.key === 'k' && e.ctrlKey) {
			e.preventDefault()
			handleRemodulate()
		}
	}

	if (isLoading) {
		return (
			<div className="message-thread">
				<div className="message-thread-header">{conversationName}</div>
				<div className="message-thread-loading">Loading messages...</div>
			</div>
		)
	}

	return (
		<div className="message-thread">
			<div className="message-thread-header">{conversationName}</div>
			
			<div className="message-thread-messages">
				{messages.length === 0 ? (
					<div className="message-thread-empty">
						No messages yet. Start the conversation!
					</div>
				) : (
					messages.map(msg => (
						<div key={msg.id} className={`message message-${msg.direction}`}>
							<div className="message-content">
								{msg.direction === 'incoming' && msg.author_name && (
									<div className="message-author">{msg.author_name}</div>
								)}
								<div
									className="message-text"
									dangerouslySetInnerHTML={{ __html: toSafeMultilineHtml(msg.content) }}
								/>
								<div className="message-timestamp">
									{new Date(msg.timestamp).toLocaleTimeString()}
								</div>
								{msg.direction === 'incoming' && onCopyToReshaper && (
									<button 
										className="copy-to-reshaper-btn"
										onClick={() => onCopyToReshaper(msg.content)}
										title="Copy to Reply Re-Shaper"
									>
										🔄 Re-Shape
									</button>
								)}
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			<div className="message-thread-input">
				<textarea
					value={messageInput}
					onChange={e => setMessageInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
					rows={3}
				/>
				<div className="message-input-actions">
					<button 
						className="btn-remodulate"
						onClick={handleRemodulate} 
						disabled={!messageInput.trim() || isRemodulating}
						title="Remodulate with AI (Ctrl+K)"
					>
						{isRemodulating ? '🔄 Remodulating...' : '✨ Remodulate with Mistral'}
					</button>
					<button 
						className="btn-send"
						onClick={handleSend} 
						disabled={!messageInput.trim()}
						title="Send message (Ctrl+Enter or Enter)"
					>
						📤 Send to Discord
					</button>
				</div>
			</div>
		</div>
	)
}
