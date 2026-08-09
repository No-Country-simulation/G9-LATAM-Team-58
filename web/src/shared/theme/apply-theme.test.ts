import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConfigStore } from '@/shared/config/config-store';
import { getResolvedTheme, resolveTheme, startThemeSync, subscribeToResolvedTheme } from './apply-theme';

function stubMatchMedia(matches: boolean) {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches,
		media: query,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	})) as unknown as typeof window.matchMedia;
}

describe('resolveTheme', () => {
	it('returns the explicit preference unchanged for light/dark', () => {
		expect(resolveTheme('light')).toBe('light');
		expect(resolveTheme('dark')).toBe('dark');
	});

	it('asks the OS via matchMedia when the preference is "system"', () => {
		stubMatchMedia(true);
		expect(resolveTheme('system')).toBe('dark');

		stubMatchMedia(false);
		expect(resolveTheme('system')).toBe('light');
	});
});

describe('startThemeSync', () => {
	afterEach(() => {
		useConfigStore.setState({ theme: 'dark' });
	});

	it('applies the current preference to <html> immediately', () => {
		stubMatchMedia(false);
		useConfigStore.setState({ theme: 'light' });

		const teardown = startThemeSync();

		expect(document.documentElement.classList.contains('light')).toBe(true);
		expect(getResolvedTheme()).toBe('light');

		teardown();
	});

	it('re-syncs when the store preference changes, notifying subscribers', () => {
		stubMatchMedia(false);
		useConfigStore.setState({ theme: 'light' });
		const teardown = startThemeSync();

		const listener = vi.fn();
		const unsubscribe = subscribeToResolvedTheme(listener);

		useConfigStore.getState().setTheme('dark');

		expect(getResolvedTheme()).toBe('dark');
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(listener).toHaveBeenCalled();

		unsubscribe();
		teardown();
	});

	it('the returned teardown unsubscribes from the store', () => {
		stubMatchMedia(false);
		const teardown = startThemeSync();
		teardown();

		const themeBefore = getResolvedTheme();
		useConfigStore.getState().setTheme(themeBefore === 'dark' ? 'light' : 'dark');

		// No listener/DOM update should happen once torn down.
		expect(getResolvedTheme()).toBe(themeBefore);
	});
});
