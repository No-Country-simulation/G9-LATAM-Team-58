import { ErrorBanner } from '@/components/feedback/error-banner';
import { useElementSize } from '@/shared/hooks/use-element-size';
import type { ApiError } from '@/shared/api/client';
import type { MapPoint } from '@/shared/api/contracts';
import { CategoryLegend } from './category-legend';
import { MapLoading } from './map-loading';
import { MapSearch } from './map-search';
import { PointDetailPanel } from './point-detail-panel';
import { ScatterPlot } from './scatter-plot';

interface MapPanelProps {
	isPending: boolean;
	error: ApiError | null;
	points: MapPoint[] | null;
	onRetry: () => void;
	activeCategory: string | undefined;
	onToggleCategory: (category: string) => void;
	query: string;
	onQueryChange: (query: string) => void;
	selectedPoint: MapPoint | undefined;
	onSelect: (point: MapPoint) => void;
	onCloseDetail: () => void;
}

/**
 * Routes the three states of the map body; each one owns its layout. The
 * scatter area measures itself — not the page — so opening the detail panel
 * (which takes 360px) properly shrinks the SVG instead of leaving it overflow
 * behind the panel.
 */
export function MapPanel({
	isPending,
	error,
	points,
	onRetry,
	activeCategory,
	onToggleCategory,
	query,
	onQueryChange,
	selectedPoint,
	onSelect,
	onCloseDetail
}: MapPanelProps) {
	const [scatterRef, size] = useElementSize<HTMLDivElement>();

	if (isPending) {
		return <MapLoading />;
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center p-8">
				<div className="w-full max-w-md">
					<ErrorBanner title="No se pudo cargar el mapa" error={error} onRetry={onRetry} />
				</div>
			</div>
		);
	}

	if (!points) {
		return null;
	}

	const byCategory: Record<string, number> = {};
	for (const point of points) {
		byCategory[point.category] = (byCategory[point.category] ?? 0) + 1;
	}

	return (
		<div ref={scatterRef} className="relative h-full">
			<div className="absolute inset-0">
				<ScatterPlot
					points={points}
					width={size.width}
					height={size.height}
					activeCategory={activeCategory}
					query={query}
					selectedId={selectedPoint?.id}
					onSelect={onSelect}
				/>
			</div>
			<CategoryLegend
				byCategory={byCategory}
				total={points.length}
				active={activeCategory}
				onToggle={onToggleCategory}
			/>
			<MapSearch value={query} onChange={onQueryChange} />
			{selectedPoint && <PointDetailPanel point={selectedPoint} onClose={onCloseDetail} />}
		</div>
	);
}
