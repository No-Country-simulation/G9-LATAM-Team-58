import { useQuery } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/client';
import type { ModelResponse, StatsResponse } from '@/shared/api/contracts';
import { getModelInfo, getStats } from './api';

export const dashboardKeys = {
	all: ['dashboard'] as const,
	stats: () => [...dashboardKeys.all, 'stats'] as const,
	model: () => [...dashboardKeys.all, 'model'] as const
};

export function useStats() {
	return useQuery<StatsResponse, ApiError>({
		queryKey: dashboardKeys.stats(),
		queryFn: getStats
	});
}

export function useModelInfo() {
	return useQuery<ModelResponse, ApiError>({
		queryKey: dashboardKeys.model(),
		queryFn: getModelInfo
	});
}
