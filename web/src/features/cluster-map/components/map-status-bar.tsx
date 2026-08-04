const zoomFormatter = new Intl.NumberFormat('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function MapStatusBar({ count, zoomLevel }: { count: number; zoomLevel: number }) {
	return (
		<div className="absolute bottom-6 left-6 z-20 rounded-md border border-outline bg-card/80 px-3 py-1.5 backdrop-blur-md">
			<span className="font-mono text-[11px] text-text-dim tabular-nums">
				{count.toLocaleString('es')} puntos · UMAP 2D · zoom {zoomFormatter.format(zoomLevel)}x
			</span>
		</div>
	);
}
