import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onStoreChange: () => void) {
	const mql = window.matchMedia(MOBILE_QUERY);
	mql.addEventListener('change', onStoreChange);
	return () => mql.removeEventListener('change', onStoreChange);
}

function getSnapshot() {
	return window.matchMedia(MOBILE_QUERY).matches;
}

// No window during a hypothetical prerender: assume desktop.
function getServerSnapshot() {
	return false;
}

/**
 * Reads the viewport straight from `matchMedia`, so the very first render
 * already knows whether we are on mobile — no effect, no cascading render, and
 * no desktop-to-mobile jump on phones.
 */
export function useIsMobile() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
