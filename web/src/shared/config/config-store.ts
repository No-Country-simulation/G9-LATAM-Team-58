import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Storage key for the persisted preferences.
 *
 * KEEP IN SYNC with the inline script in index.html, which reads this same key
 * before the first paint and cannot import TypeScript.
 */
export const CONFIG_STORAGE_KEY = 'mindloom.config';

export const DEFAULT_THEME: ThemePreference = 'dark';

interface ConfigState {
	theme: ThemePreference;
	setTheme: (theme: ThemePreference) => void;
}

/**
 * User preferences that survive reloads. Theme is the first one; density,
 * default search mode and friends belong here too — bump `version` and add a
 * `migrate` when the shape changes.
 */
export const useConfigStore = create<ConfigState>()(
	persist(
		set => ({
			theme: DEFAULT_THEME,
			setTheme: theme => set({ theme })
		}),
		{ name: CONFIG_STORAGE_KEY, version: 1 }
	)
);
