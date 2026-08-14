import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';

// 4xx errors are contract violations: retrying them is pointless.
export function shouldRetry(failureCount: number, error: Error): boolean {
	if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
		return false;
	}
	return failureCount < 2;
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			refetchOnWindowFocus: false,
			retry: shouldRetry
		}
	}
});
