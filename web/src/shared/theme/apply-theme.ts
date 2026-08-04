import { useConfigStore, type ThemePreference } from '@/shared/config/config-store';

export type ResolvedTheme = 'light' | 'dark';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Turns a preference into the theme actually shown ('system' asks the OS). */
export function resolveTheme(preference: ThemePreference): ResolvedTheme {
	if (preference === 'system') {
		return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
	}
	return preference;
}

// Tiny external store holding what is currently painted, so components can read
// it with useSyncExternalStore instead of re-querying matchMedia on every render.
let resolvedTheme: ResolvedTheme = 'dark';
const listeners = new Set<() => void>();

export function getResolvedTheme(): ResolvedTheme {
	return resolvedTheme;
}

export function subscribeToResolvedTheme(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function applyTheme(next: ResolvedTheme) {
	const root = document.documentElement;
	root.classList.toggle('dark', next === 'dark');
	root.classList.toggle('light', next === 'light');
	// Keeps scrollbars and native controls in the right mode.
	root.style.colorScheme = next;

	if (next !== resolvedTheme) {
		resolvedTheme = next;
		listeners.forEach(listener => listener());
	}
}

/**
 * Keeps <html> in sync with the stored preference and with the OS setting.
 * Call once at startup, before rendering; returns the teardown.
 *
 * This lives outside React on purpose: the theme is an app-wide DOM effect, not
 * component state, so it needs no provider in the tree.
 */
export function startThemeSync() {
	const mql = window.matchMedia(DARK_QUERY);
	const sync = () => applyTheme(resolveTheme(useConfigStore.getState().theme));

	sync();
	const unsubscribeStore = useConfigStore.subscribe(sync);
	mql.addEventListener('change', sync);

	return () => {
		unsubscribeStore();
		mql.removeEventListener('change', sync);
	};
}
