export type InstructionPreset = {
	id: string
	label: string
	system: string
}

export const PRESETS: InstructionPreset[] = [
	{
		id: 'neutral',
		label: 'Neutral rewrite',
		system: 'Rewrite the text for clarity and correct grammar. Keep meaning and tone.',
	},
	{
		id: 'short',
		label: 'Shorten',
		system: 'Rewrite the text shorter and more direct. Preserve key points.',
	},
	{
		id: 'polite',
		label: 'More polite',
		system: 'Rewrite the text to be polite and constructive. Avoid harsh wording.',
	},
	{
		id: 'custom',
		label: 'Custom…',
		system: '',
	},
]
