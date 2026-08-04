import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/client';
import type { IngestionResponse } from '@/shared/api/contracts';
import { contentKeys } from '@/features/contents';
import { mapKeys } from '@/features/cluster-map';
import { dashboardKeys } from '@/features/dashboard';
import { analyzeContent, type AnalyzeInput } from './api';

// Analyzing persists the content, so the list, the stats and the map change.
export function useAnalyzeContent() {
	const queryClient = useQueryClient();

	return useMutation<IngestionResponse, ApiError, AnalyzeInput>({
		mutationFn: analyzeContent,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contentKeys.all });
			void queryClient.invalidateQueries({ queryKey: mapKeys.all });
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
		}
	});
}
