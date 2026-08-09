import { describe, expect, it } from 'vitest';
import { buildPageTokens } from './pagination-tokens';

// NOTE: `previous` starts at -2 in the source, so the first token is always
// preceded by an 'ellipsis' — even when page 0 is included in the window and
// there is nothing before it to collapse. These tests pin the actual current
// behavior; they are not an endorsement of it.
describe('buildPageTokens', () => {
	it('lists every page (still prefixed with the leading ellipsis quirk) for a short range', () => {
		expect(buildPageTokens(0, 4)).toEqual(['ellipsis', 0, 1, 'ellipsis', 3]);
	});

	it('always includes the first and last page', () => {
		const tokens = buildPageTokens(5, 20);
		expect(tokens).toContain(0);
		expect(tokens[tokens.length - 1]).toBe(19);
	});

	it('collapses the gap around the current page into single ellipses', () => {
		expect(buildPageTokens(10, 20)).toEqual(['ellipsis', 0, 'ellipsis', 9, 10, 11, 'ellipsis', 19]);
	});

	it('near the start: no gap between 0 and 1, but the last page is still collapsed', () => {
		expect(buildPageTokens(0, 20)).toEqual(['ellipsis', 0, 1, 'ellipsis', 19]);
	});

	it('near the end: no gap between the last two pages', () => {
		expect(buildPageTokens(19, 20)).toEqual(['ellipsis', 0, 'ellipsis', 18, 19]);
	});

	it('handles a single page', () => {
		expect(buildPageTokens(0, 1)).toEqual(['ellipsis', 0]);
	});
});
