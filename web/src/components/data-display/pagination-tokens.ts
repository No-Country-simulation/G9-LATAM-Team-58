export type PageToken = number | 'ellipsis';

/**
 * Always shows the first, the last, and a window of one page around the
 * current one, collapsing everything else into a single ellipsis per gap.
 */
export function buildPageTokens(page: number, totalPages: number): PageToken[] {
	const tokens: PageToken[] = [];
	const window = new Set([0, totalPages - 1, page - 1, page, page + 1]);

	let previous = -2;
	for (let index = 0; index < totalPages; index++) {
		if (!window.has(index)) {
			continue;
		}
		if (index - previous > 1) {
			tokens.push('ellipsis');
		}
		tokens.push(index);
		previous = index;
	}
	return tokens;
}
