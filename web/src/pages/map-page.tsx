import { useState } from 'react';
import { MapPanel, useMapParamsState, useMapPoints } from '@/features/cluster-map';
import { PageHeader } from '@/components/layout/page-header';

export function MapPage() {
	const points = useMapPoints();
	const params = useMapParamsState();
	const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
	const [query, setQuery] = useState('');

	const selectedPoint = points.data?.find(point => point.id === params.selectedId);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-6 pt-8 pb-4">
			<PageHeader
				title="Mapa de conocimiento"
				description="Explora cómo se agrupan los documentos por similitud semántica."
			/>
			<div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
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
		</div>
	);
}
