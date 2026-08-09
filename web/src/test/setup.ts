import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { apiClient } from '@/shared/api/client';
import { server } from './msw/server';

// jsdom's XMLHttpRequest (axios's default adapter here) isn't reliably
// intercepted by msw/node's interceptors; the node http adapter is.
apiClient.defaults.adapter = 'http';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
	server.resetHandlers();
	cleanup();
});
afterAll(() => server.close());

// jsdom implements neither: apply-theme.ts and use-mobile.ts need matchMedia,
// use-element-size.ts (and the cluster-map feature built on it) needs
// ResizeObserver.
if (!window.matchMedia) {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}));
}

if (!window.ResizeObserver) {
	window.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}
