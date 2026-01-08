import { useState, useEffect } from 'react'
import './Settings.css'

interface SettingsProps {
	onClose: () => void
}

export default function Settings({ onClose }: SettingsProps) {
	const [discordToken, setDiscordToken] = useState('')
	const [isConnecting, setIsConnecting] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'disconnected' | 'error'>('idle')
	const [statusMessage, setStatusMessage] = useState('')
	const [privacyConsent, setPrivacyConsent] = useState(false)

	useEffect(() => {
		// Load saved token on mount
		window.keeper.tokenLoad('discord')
			.then(token => {
				if (token) {
					setDiscordToken(token)
				}
			})
			.catch(err => console.log('Token load skipped:', err))

		// Check if already connected
		window.keeper.discordStatus()
			.then(isConnected => {
				if (isConnected) {
					setConnectionStatus('connected')
					setStatusMessage('Discord bot is connected')
				} else {
					setConnectionStatus('disconnected')
				}
			})
			.catch(err => console.log('Status check skipped:', err))
	}, [])

	const handleSaveToken = async () => {
		if (!discordToken.trim()) {
			setStatusMessage('Please enter a Discord bot token')
			setConnectionStatus('error')
			return
		}

		try {
			await window.keeper.tokenSave({ platform: 'discord', token: discordToken })
			setStatusMessage('Token saved successfully')
			setConnectionStatus('idle')
		} catch (err) {
			setStatusMessage('Failed to save token')
			setConnectionStatus('error')
		}
	}

	const handleConnect = async () => {
		if (!discordToken.trim()) {
			setStatusMessage('Please enter a Discord bot token')
			setConnectionStatus('error')
			return
		}

		if (!privacyConsent) {
			setStatusMessage('Please read and accept the Privacy & Data Policy')
			setConnectionStatus('error')
			return
		}

		setIsConnecting(true)
		setStatusMessage('Connecting to Discord...')
		setConnectionStatus('idle')

		try {
			// Save token first
			await window.keeper.tokenSave({ platform: 'discord', token: discordToken })
			
			// Then connect
			const success = await window.keeper.discordConnect(discordToken)
			
			if (success) {
				setConnectionStatus('connected')
				setStatusMessage('Discord bot connected successfully!')
			} else {
				setConnectionStatus('error')
				setStatusMessage('Failed to connect. Check your token and bot permissions.')
			}
		} catch (err) {
			setConnectionStatus('error')
			setStatusMessage(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`)
		} finally {
			setIsConnecting(false)
		}
	}

	const handleDisconnect = async () => {
		try {
			await window.keeper.discordDisconnect()
			setConnectionStatus('disconnected')
			setStatusMessage('Discord bot disconnected')
		} catch (err) {
			setStatusMessage('Failed to disconnect')
			setConnectionStatus('error')
		}
	}

	const handleClearToken = async () => {
		try {
			await window.keeper.tokenClear('discord')
			setDiscordToken('')
			setConnectionStatus('disconnected')
			setStatusMessage('Token cleared')
		} catch (err) {
			setStatusMessage('Failed to clear token')
			setConnectionStatus('error')
		}
	}

	const handleClearData = async () => {
		if (!confirm('This will delete all conversation history and messages. Continue?')) {
			return
		}

		try {
			await window.keeper.dbClearAll()
			setStatusMessage('All data cleared successfully')
			setConnectionStatus('idle')
		} catch (err) {
			setStatusMessage('Failed to clear data')
			setConnectionStatus('error')
		}
	}

	return (
		<div className="settings-overlay" onClick={onClose}>
			<div className="settings-modal" onClick={e => e.stopPropagation()}>
				<div className="settings-header">
					<h2>Settings</h2>
					<button className="close-btn" onClick={onClose}>✕</button>
				</div>

				<div className="settings-content">
					<section className="settings-section">
						<h3>Discord Bot Configuration</h3>
						
						<div className="form-group">
							<label htmlFor="discord-token">Bot Token</label>
							<input
								id="discord-token"
								type="password"
								value={discordToken}
								onChange={e => setDiscordToken(e.target.value)}
								placeholder="Enter your Discord bot token"
								disabled={isConnecting}
							/>
							<small>
								Create a bot at <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer">Discord Developer Portal</a>
								<br />
								Required intents: GUILDS, GUILD_MESSAGES, DIRECT_MESSAGES, MessageContent (privileged)
							</small>
						</div>

						<div className="button-group">
							<button 
								onClick={handleSaveToken} 
								disabled={isConnecting || !discordToken.trim()}
								className="btn-secondary"
							>
								Save Token
							</button>
							<button 
								onClick={handleClearToken} 
								disabled={isConnecting || !discordToken.trim()}
								className="btn-secondary"
							>
								Clear Token
							</button>
						</div>

						<div className="button-group">
							{connectionStatus === 'connected' ? (
								<button 
									onClick={handleDisconnect} 
									disabled={isConnecting}
									className="btn-danger"
								>
									Disconnect
								</button>
							) : (
								<button 
									onClick={handleConnect} 
									disabled={isConnecting || !discordToken.trim() || !privacyConsent}
									className="btn-primary"
								>
									{isConnecting ? 'Connecting...' : 'Test Connection'}
								</button>
							)}
						</div>

						<div className="privacy-consent">
							<label>
								<input
									type="checkbox"
									checked={privacyConsent}
									onChange={e => setPrivacyConsent(e.target.checked)}
								/>
								<span>I understand and accept the Privacy & Data Policy</span>
							</label>
						</div>

						{statusMessage && (
							<div className={`status-message status-${connectionStatus}`}>
								{statusMessage}
							</div>
						)}
					</section>

					<section className="settings-section">
						<h3>Privacy & Data Policy</h3>
						<div className="privacy-policy">
							<p><strong>What we collect:</strong></p>
							<ul>
								<li>Message content from Discord conversations</li>
								<li>Usernames and display names</li>
								<li>Message timestamps</li>
							</ul>

							<p><strong>Where it's stored:</strong></p>
							<ul>
								<li>Locally on your computer (SQLite database)</li>
								<li>Location: App userData folder</li>
								<li>No cloud sync, no third-party access</li>
							</ul>

							<p><strong>How long:</strong></p>
							<ul>
								<li>Messages retained indefinitely unless manually deleted</li>
								<li>You can clear all data anytime using the button below</li>
							</ul>

							<p><strong>Your control:</strong></p>
							<ul>
								<li>Disconnect bot anytime to stop message collection</li>
								<li>Delete all conversation history via Clear All Data</li>
								<li>Data is yours - stored locally only</li>
							</ul>

							<p><strong>Discord compliance:</strong></p>
							<ul>
								<li>Uses official Discord Bot API</li>
								<li>No user account automation</li>
								<li>Respects Discord rate limits</li>
								<li>Bot token encrypted with OS keychain</li>
							</ul>
						</div>

						<div className="button-group">
							<button 
								onClick={handleClearData}
								className="btn-danger"
							>
								Clear All Data
							</button>
						</div>
					</section>
				</div>
			</div>
		</div>
	)
}
