import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { render, type RenderOptions } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';

// Fresh QueryClient per call: sharing the app's singleton (shared/config/query-client.ts)
// would leak cache and in-flight state between tests. Retries are off so failed
// requests reject immediately instead of stalling tests behind backoff delays.
function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: 0 },
			mutations: { retry: false }
		}
	});
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
	initialEntries?: string[];
	queryClient?: QueryClient;
}

export function renderWithProviders(ui: ReactElement, options: RenderWithProvidersOptions = {}) {
	const { initialEntries = ['/'], queryClient = createTestQueryClient(), ...renderOptions } = options;

	function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<TooltipProvider>
					<MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
				</TooltipProvider>
			</QueryClientProvider>
		);
	}

	return { queryClient, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from '@testing-library/react';
