import { describe, expect, it } from 'vitest';
import { findActiveNavItem } from './navigation';

describe('findActiveNavItem', () => {
	it('matches the home route only on an exact "/"', () => {
		expect(findActiveNavItem('/')?.item.to).toBe('/');
		expect(findActiveNavItem('/algo')?.item.to).not.toBe('/');
	});

	it('matches a detail route via startsWith on its list route', () => {
		expect(findActiveNavItem('/contenidos/abc-123')?.item.to).toBe('/contenidos');
	});

	it('matches a list route exactly', () => {
		expect(findActiveNavItem('/buscar')?.item.to).toBe('/buscar');
	});

	it('returns null for an unknown route', () => {
		expect(findActiveNavItem('/no-existe')).toBeNull();
	});
});
