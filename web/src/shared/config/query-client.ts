import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				// 4xx errors are contract violations: retrying them is pointless.
				if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
					return false;
				}
				return failureCount < 2;
			}
		}
	}
});
