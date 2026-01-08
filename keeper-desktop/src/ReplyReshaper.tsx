import { useState } from 'react'
import './ReplyReshaper.css'
import { PRESETS } from './llmPresets'

interface ReplyReshaperProps {
	ollamaBaseUrl: string
	ollamaModel: string
	initialContext?: string
}

export default function ReplyReshaper({ ollamaBaseUrl, ollamaModel, initialContext = '' }: ReplyReshaperProps) {
	const [externalMessage, setExternalMessage] = useState(initialContext)
	const [userDraft, setUserDraft] = useState('')
	const [llmOutput, setLlmOutput] = useState('')
	const [isGenerating, setIsGenerating] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [presetId, setPresetId] = useState(PRESETS[0]?.id ?? 'neutral')
	const [customSystem, setCustomSystem] = useState('')

	const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]
	const advisorSystem = presetId === 'custom' ? customSystem : preset?.system ?? ''

	async function handleReshape() {
		if (!userDraft.trim()) {
			setError('Please enter your draft reply in Input B')
			return
		}

		setIsGenerating(true)
		setError(null)
		setLlmOutput('')

		try {
			// Build the prompt that uses external message as context only
			const contextPart = externalMessage.trim() 
				? `Context (external message received):\n"${externalMessage.trim()}"\n\n` 
				: ''
			
			const systemPrompt = `You are a reply re-shaper. You help users craft better replies by reshaping their draft.

Hard rules (must follow):
- The external message is context only. Never rewrite or alter it.
- ONLY reshape what the user already intends to say in their draft.
- Do NOT add new intent, new ideas, new facts, or new commitments.
- Output 1 (max 2) concrete reply formulations.
- No explanations, no analysis, no labels.

Additional style guidance (optional):
${advisorSystem?.trim() ? advisorSystem.trim() : '(none)'}
`

			const userPrompt = `${contextPart}User's draft reply:\n"${userDraft.trim()}"\n\nReshape this into a polished reply:`

			const result = await window.keeper.ollamaChat({
				baseUrl: ollamaBaseUrl,
				model: ollamaModel,
				system: systemPrompt,
				prompt: userPrompt
			})

			setLlmOutput(result.content)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to generate reply')
		} finally {
			setIsGenerating(false)
		}
	}

	function handleCopyOutput() {
		if (llmOutput) {
			navigator.clipboard.writeText(llmOutput)
		}
	}

	function handleClear() {
		setExternalMessage('')
		setUserDraft('')
		setLlmOutput('')
		setError(null)
	}

	return (
		<div className="reply-reshaper">
			<div className="reshaper-header">
				<div>
					<div className="reshaper-title">Reply Re-Shaper</div>
					<div className="reshaper-subtitle">Context in A • Intent in B • Suggested reply in Output</div>
				</div>
				<div className="reshaper-header-actions">
					<button onClick={handleClear} title="Clear all fields">
						Clear
					</button>
				</div>
			</div>

			<div className="reshaper-settings">
				<div className="reshaper-settings-row">
					<label className="reshaper-settings-label">
						LLM behaviour
						<select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
							{PRESETS.map((p) => (
								<option key={p.id} value={p.id}>
									{p.label}
								</option>
							))}
						</select>
					</label>
					<button
						className="btn-reshape"
						onClick={handleReshape}
						disabled={!userDraft.trim() || isGenerating}
						title="Reshape reply"
					>
						{isGenerating ? 'Reshaping…' : 'Reshape'}
					</button>
					{llmOutput && (
						<button className="btn-secondary" onClick={handleCopyOutput} title="Copy output to clipboard">
							Copy
						</button>
					)}
				</div>
				{presetId === 'custom' && (
					<label className="reshaper-settings-label">
						Custom instruction
						<textarea
							value={customSystem}
							onChange={(e) => setCustomSystem(e.target.value)}
							rows={2}
							placeholder="Optional: tone/style constraints (must not add new intent)"
						/>
					</label>
				)}
			</div>

			<div className="reshaper-grid">
				<div className="reshaper-panel">
					<div className="reshaper-panel-header">
						<span className="reshaper-label">Input A — External Message (Context)</span>
						<span className="reshaper-hint">Read-only reference • Not modified by LLM</span>
					</div>
					<textarea
						className="reshaper-input context-input"
						value={externalMessage}
						onChange={(e) => setExternalMessage(e.target.value)}
						placeholder="Paste the message you received from the other person...&#10;&#10;This provides context but is NOT the message to be shaped."
						rows={8}
					/>
				</div>

				<div className="reshaper-panel">
					<div className="reshaper-panel-header">
						<span className="reshaper-label">Input B — Your Draft Reply</span>
						<span className="reshaper-hint">What YOU want to say • Source of truth</span>
					</div>
					<textarea
						className="reshaper-input draft-input"
						value={userDraft}
						onChange={(e) => setUserDraft(e.target.value)}
						placeholder="Enter your rough reply draft, bullet points, or intent...&#10;&#10;Examples:&#10;• 'agree but need more time'&#10;• 'decline politely, suggest alternative'&#10;• 'thanks for the offer, will consider it'"
						rows={8}
					/>
				</div>

				<div className="reshaper-panel">
					<div className="reshaper-panel-header">
						<span className="reshaper-label">Output — LLM Suggested Reply</span>
						<span className="reshaper-hint">Copy/paste ready</span>
					</div>
					<textarea
						className="reshaper-output"
						value={llmOutput}
						readOnly
						placeholder="Your reshaped reply will appear here..."
						rows={8}
					/>
				</div>
			</div>

			{error && <div className="reshaper-error">{error}</div>}
		</div>
	)
}
