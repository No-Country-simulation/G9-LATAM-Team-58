import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/client';
import type { BatchUploadResponse } from '@/shared/api/contracts';
import { contentKeys } from '@/features/contents';
import { mapKeys } from '@/features/cluster-map';
import { dashboardKeys } from '@/features/dashboard';
import { uploadBatch } from './api';

// NOTE: the endpoint returns 200 even with per-row failures — read `failed`
// and `errors` from the response, never the HTTP status.
export function useBatchUpload() {
	const queryClient = useQueryClient();

	return useMutation<BatchUploadResponse, ApiError, File>({
		mutationFn: uploadBatch,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contentKeys.all });
			void queryClient.invalidateQueries({ queryKey: mapKeys.all });
			void queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
		}
	});
}
