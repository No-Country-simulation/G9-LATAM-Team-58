import { useMemo, useState } from 'react';
import { MapPanel, useMapParamsState, useMapPoints } from '@/features/cluster-map';
import type { MapPoint } from '@/shared/api/contracts';

export function MapPage() {
	const points = useMapPoints();
	const params = useMapParamsState();
	const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
	const [query, setQuery] = useState('');

	const selectedPoint = useMemo<MapPoint | undefined>(
		() => points.data?.find(point => point.id === params.selectedId),
		[points.data, params.selectedId]
	);

	return (
		<div className="h-[calc(100dvh-5rem)] overflow-hidden rounded-lg border">
			<MapPanel
				isPending={points.isPending}
				error={points.error}
				points={points.data ?? null}
				onRetry={() => points.refetch()}
				activeCategory={activeCategory}
				onToggleCategory={category => setActiveCategory(current => (current === category ? undefined : category))}
				query={query}
				onQueryChange={setQuery}
				selectedPoint={selectedPoint}
				onSelect={point => params.select(point.id)}
				onCloseDetail={() => params.select(undefined)}
			/>
		</div>
	);
}
