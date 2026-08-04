import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/client';
import type { IngestionResponse } from '@/shared/api/contracts';
import { contentKeys } from '@/features/contents';
import { mapKeys } from '@/features/cluster-map';
import { dashboardKeys } from '@/features/dashboard';
import { createContent, type CreateContentInput } from './api';

// A new content changes the list, the stats and the map: invalidate all three.
export function useCreateContent() {
	const queryClient = useQueryClient();

	return useMutation<IngestionResponse, ApiError, CreateContentInput>({
		mutationFn: createContent,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contentKeys.all });
			void queryClient.invalidateQueries({ queryKey: mapKeys.all });
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
		}
	});
}
