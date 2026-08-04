import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/shared/config/query-client';
import { startThemeSync } from '@/shared/theme/apply-theme';
import { router } from './routes';

// Runs at import time, before React renders: an effect would fire after the
// first paint and the theme class would arrive late, making the page jump.
// Do not move this into a component or a useEffect.
//
// Known gap: the browser can still paint once before this module executes.
// Closing it needs either an inline script in index.html or making the dark
// tokens the `:root` default — pending decision.
startThemeSync();

/**
 * Application composition: everything the app needs wired together. `main.tsx`
 * only mounts this.
 */
export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<RouterProvider router={router} />
				<Toaster richColors closeButton position="top-right" />
			</TooltipProvider>
		</QueryClientProvider>
	);
}
