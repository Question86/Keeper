import { useState, useEffect } from 'react'
import './App.css'
import Settings from './Settings'
import ConversationList from './ConversationList'
import MessageThread from './MessageThread'
import ReplyReshaper from './ReplyReshaper'
import { PRESETS, type InstructionPreset } from './llmPresets'

type Destination = 'battleNet' | 'discordDM' | 'discordWebhook' | 'email'
type ViewMode = 'compose' | 'chat' | 'reshaper'

interface Conversation {
  id: string
  platform: string
  display_name: string | null
  avatar_url: string | null
  last_message_at: number | null
}

function App() {
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434')
  const [model, setModel] = useState('mistral')
  const [presetId, setPresetId] = useState<InstructionPreset['id']>('neutral')
  const [customSystem, setCustomSystem] = useState('')

  const [draft, setDraft] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isForwarding, setIsForwarding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const [viewMode, setViewMode] = useState<ViewMode>('compose')
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [reshaperContext, setReshaperContext] = useState('')

  const [destination, setDestination] = useState<Destination>('battleNet')
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('')
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]
  const system = presetId === 'custom' ? customSystem : preset.system

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+, opens settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
      }
      // Ctrl+1 for Compose view
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault()
        setViewMode('compose')
      }
      // Ctrl+2 for Chat view
      if (e.ctrlKey && e.key === '2') {
        e.preventDefault()
        setViewMode('chat')
      }
      // Ctrl+3 for Reply Re-Shaper view
      if (e.ctrlKey && e.key === '3') {
        e.preventDefault()
        setViewMode('reshaper')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function generate() {
    setError(null)
    setIsLoading(true)
    try {
      const res = await window.keeper.ollamaChat({
        baseUrl,
        model,
        system,
        prompt: draft,
      })
      setOutput(res.content)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendMessage(content: string) {
    if (!activeConversation) return
    
    setError(null)
    setSuccessMessage(null)
    
    try {
      const success = await window.keeper.discordSend({
        conversationId: activeConversation.id,
        content
      })
      
      if (success) {
        setSuccessMessage('✓ Message sent')
        setTimeout(() => setSuccessMessage(null), 2000)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function forwardFinal() {
    if (isForwarding) return // Prevent multiple clicks
    
    setError(null)
    setSuccessMessage(null)
    setIsForwarding(true)
    
    try {
      if (!output.trim()) throw new Error('Nothing to forward')

      if (destination === 'discordWebhook') {
        await window.keeper.discordWebhookSend({ webhookUrl: discordWebhookUrl, content: output })
        setSuccessMessage('✓ Sent to Discord webhook')
        setTimeout(() => setSuccessMessage(null), 3000)
        return
      }

      if (destination === 'email') {
        const to = encodeURIComponent(emailTo.trim())
        const subject = encodeURIComponent(emailSubject)
        const body = encodeURIComponent(output)
        const mailto = `mailto:${to}?subject=${subject}&body=${body}`
        await window.keeper.openExternal(mailto)
        setSuccessMessage('✓ Opened mail client')
        setTimeout(() => setSuccessMessage(null), 3000)
        return
      }

      if (destination === 'discordDM') {
        setSuccessMessage('Sending to Discord (auto-focus)...')
        await window.keeper.osFocusDiscordPasteSend(output)
        setSuccessMessage('✓ Sent to Discord (active chat)')
        setTimeout(() => setSuccessMessage(null), 3000)
        return
      }

      // battleNet: OS-driven paste/send - give user time to focus window
      setSuccessMessage('Focus target window now... 2')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccessMessage('Focus target window now... 1')
      await new Promise(resolve => setTimeout(resolve, 1000))

      await window.keeper.osPasteSend(output)
      const target = 'focused window'
      setSuccessMessage(`✓ Sent to ${target}`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsForwarding(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="title">Keeper — Compose → Remodulate → Forward</div>
          <div className="subtitle">Desktop MVP (Ollama/Mistral)</div>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'compose' ? 'active' : ''} 
              onClick={() => setViewMode('compose')}
              title="Compose mode (Ctrl+1)"
            >
              ✍️ Compose
            </button>
            <button 
              className={viewMode === 'chat' ? 'active' : ''} 
              onClick={() => setViewMode('chat')}
              title="Chat mode (Ctrl+2)"
            >
              💬 Chat
            </button>
            <button 
              className={viewMode === 'reshaper' ? 'active' : ''} 
              onClick={() => setViewMode('reshaper')}
              title="Reply Re-Shaper (Ctrl+3)"
            >
              🔄 Re-Shaper
            </button>
          </div>
          <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings (Ctrl+,)">
            ⚙️
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="row">
          <label>
            Ollama URL
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://localhost:11434" />
          </label>
          <label>
            Model
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="mistral" />
          </label>
        </div>

        {viewMode === 'compose' && (
          <>
            <label>
              Destination
              <select value={destination} onChange={(e) => setDestination(e.target.value as Destination)}>
                <option value="discordDM">Discord (auto-focus + send to active chat)</option>
                <option value="battleNet">Battle.net (OS paste/send - must be focused)</option>
                <option value="discordWebhook">Discord server channel (webhook)</option>
                <option value="email">Email (mailto)</option>
              </select>
            </label>

            {destination === 'discordDM' && (
              <div style={{ padding: '8px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                ⚠️ This will briefly bring Discord Desktop to the foreground and send to whatever chat is currently active there.
              </div>
            )}

            {destination === 'battleNet' && (
              <div style={{ padding: '8px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                ⚠️ Focus the Battle.net chat window before clicking Forward. This will paste and send automatically.
              </div>
            )}

            {destination === 'discordWebhook' && (
              <label>
                Discord webhook URL
                <input
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </label>
            )}

            {destination === 'email' && (
              <div className="row">
                <label>
                  Email to
                  <input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="name@example.com" />
                </label>
                <label>
                  Subject
                  <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="(optional)" />
                </label>
              </div>
            )}

            <label>
              Instruction snippet
              <select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            {presetId === 'custom' && (
              <label>
                Custom instruction
                <textarea value={customSystem} onChange={(e) => setCustomSystem(e.target.value)} rows={3} />
              </label>
            )}
          </>
        )}
      </section>

      {viewMode === 'compose' ? (
        <section className="grid">
          <div className="panel">
            <div className="panelTitle">Draft</div>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={10} />
            <div className="actions">
              <button onClick={generate} disabled={isLoading || !draft.trim()} title="Generate AI remodulation (Ctrl+Enter)">
                {isLoading ? '⏳ Generating…' : '✨ Send to Mistral'}
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panelTitle">Remodulated (editable)</div>
            <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={10} />
            <div className="actions">
              <button onClick={forwardFinal} disabled={!output.trim() || isLoading || isForwarding} title="Forward to selected destination">
                {isForwarding ? '⏳ Forwarding...' : '📤 Forward'}
              </button>
            </div>
          </div>
        </section>
      ) : viewMode === 'chat' ? (
        <section className="chat-view">
          <ConversationList 
            onSelectConversation={setActiveConversation}
            activeConversationId={activeConversation?.id ?? null}
          />
          {activeConversation ? (
            <MessageThread
              conversationId={activeConversation.id}
              conversationName={activeConversation.display_name ?? '(unknown)'}
              onSendMessage={handleSendMessage}
              ollamaBaseUrl={baseUrl}
              ollamaModel={model}
              onCopyToReshaper={(message) => {
                setReshaperContext(message)
                setViewMode('reshaper')
              }}
            />
          ) : (
            <div className="chat-empty">
              Select a conversation to start chatting
            </div>
          )}
        </section>
      ) : (
        <section className="reshaper-view">
          <ReplyReshaper
            ollamaBaseUrl={baseUrl}
            ollamaModel={model}
            initialContext={reshaperContext}
          />
        </section>
      )}

      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default App
