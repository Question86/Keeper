import { useEffect, useState } from 'react'
import './ConversationList.css'

interface Conversation {
	id: string
	platform: string
	display_name: string | null
	avatar_url: string | null
	last_message_at: number | null
}

interface ConversationListProps {
	onSelectConversation: (conversation: Conversation) => void
	activeConversationId: string | null
}

export default function ConversationList({ onSelectConversation, activeConversationId }: ConversationListProps) {
	const [conversations, setConversations] = useState<Conversation[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		loadConversations()
		// Refresh every 5 seconds to catch new messages
		const interval = setInterval(loadConversations, 5000)
		return () => clearInterval(interval)
	}, [])

	async function loadConversations() {
		try {
			const convs = await window.keeper.dbGetConversations()
			setConversations(
				convs.map((c) => ({
					...c,
					display_name: c.display_name ?? '(unknown)',
					last_message_at: c.last_message_at ?? null,
				}))
			)
		} catch (err) {
			console.error('Failed to load conversations:', err)
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading) {
		return (
			<div className="conversation-list">
				<div className="conversation-list-header">Conversations</div>
				<div className="conversation-list-loading">Loading...</div>
			</div>
		)
	}

	if (conversations.length === 0) {
		return (
			<div className="conversation-list">
				<div className="conversation-list-header">Conversations</div>
				<div className="conversation-list-empty">
					No conversations yet.
					<br />
					<small>Connect Discord bot to start receiving messages.</small>
				</div>
			</div>
		)
	}

	return (
		<div className="conversation-list">
			<div className="conversation-list-header">Conversations</div>
			<div className="conversation-list-items">
				{conversations.map(conv => (
					<div
						key={conv.id}
						className={`conversation-item ${activeConversationId === conv.id ? 'active' : ''}`}
						onClick={() => onSelectConversation(conv)}
					>
						<div className="conversation-avatar">
							{conv.avatar_url ? (
								<img src={conv.avatar_url} alt={conv.display_name ?? ''} />
							) : (
								<div className="conversation-avatar-placeholder">
									{(conv.display_name ?? '?').charAt(0).toUpperCase()}
								</div>
							)}
						</div>
						<div className="conversation-details">
							<div className="conversation-name">{conv.display_name ?? '(unknown)'}</div>
							<div className="conversation-meta">
								<span className="conversation-platform">{conv.platform}</span>
								<span className="conversation-time">
									{formatTime(conv.last_message_at)}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

function formatTime(timestamp: number | null): string {
	if (typeof timestamp !== 'number') return '—'
	const date = new Date(timestamp * 1000)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMs / 3600000)
	const diffDays = Math.floor(diffMs / 86400000)

	if (diffMins < 1) return 'just now'
	if (diffMins < 60) return `${diffMins}m ago`
	if (diffHours < 24) return `${diffHours}h ago`
	if (diffDays < 7) return `${diffDays}d ago`
	
	return date.toLocaleDateString()
}
