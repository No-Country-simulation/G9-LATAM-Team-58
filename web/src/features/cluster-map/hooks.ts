import { useQuery } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/client';
import type { MapPoint } from '@/shared/api/contracts';
import { getMapPoints } from './api';

export const mapKeys = {
	all: ['map'] as const
};

export function useMapPoints() {
	return useQuery<MapPoint[], ApiError>({
		queryKey: mapKeys.all,
		queryFn: getMapPoints,
		staleTime: 60_000
	});
}
