import { useSyncExternalStore } from 'react';
import { useConfigStore } from '@/shared/config/config-store';
import { getResolvedTheme, subscribeToResolvedTheme, type ResolvedTheme } from './apply-theme';

const SERVER_THEME: ResolvedTheme = 'dark';

function getServerSnapshot(): ResolvedTheme {
	return SERVER_THEME;
}

/**
 * `theme` is the stored preference ('system' included); `resolvedTheme` is what
 * is actually painted right now. Use the second one to pick icons or artwork,
 * the first one to render the preference itself.
 */
export function useTheme() {
	const theme = useConfigStore(state => state.theme);
	const setTheme = useConfigStore(state => state.setTheme);
	const resolvedTheme = useSyncExternalStore(subscribeToResolvedTheme, getResolvedTheme, getServerSnapshot);

	function toggleTheme() {
		setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
	}

	return { theme, resolvedTheme, setTheme, toggleTheme };
}
