import { apiClient } from '@/shared/api/client';
import type { BatchUploadResponse } from '@/shared/api/contracts';

export async function uploadBatch(file: File): Promise<BatchUploadResponse> {
	const formData = new FormData();
	formData.append('file', file);
	// No manual Content-Type: axios sets the multipart boundary itself.
	// One /predict call per CSV row, so large files take a while.
	const { data } = await apiClient.post<BatchUploadResponse>('/contents/batch', formData, { timeout: 300_000 });
	return data;
}
