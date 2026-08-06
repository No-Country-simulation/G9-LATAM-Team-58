import { apiClient } from '@/shared/api/client';
import type { MapPoint } from '@/shared/api/contracts';

// The whole corpus comes back unpaginated (only rows with a UMAP projection).
export async function getMapPoints(): Promise<MapPoint[]> {
	const { data } = await apiClient.get<MapPoint[]>('/map');
	return data;
}
