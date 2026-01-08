export function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

export function toSafeMultilineHtml(input: string): string {
	// Preserve verbatim text while ensuring it is safe to render via dangerouslySetInnerHTML.
	// This does not change what the user sees; it only encodes HTML-significant characters.
	return escapeHtml(input).replace(/\r\n|\r|\n/g, '<br/>')
}
