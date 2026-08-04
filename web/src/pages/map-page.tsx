import { useMapPoints } from '@/features/cluster-map';

// Placeholder: the scatter visualization needs a charting decision (visx,
// Recharts, ECharts...) that the team has not made yet.
export function MapPage() {
	const points = useMapPoints();

	return (
		<div className="stack">
			<h1>Mapa de conocimiento</h1>
			{points.isPending && <p className="muted">Cargando…</p>}
			{points.isError && <p className="error-text">{points.error.message}</p>}
			{points.isSuccess && (
				<p className="muted">
					{points.data.length} puntos listos para pintar. Pendiente: elegir librería de scatter (color por categoría,
					tooltip con el título, click → detalle).
				</p>
			)}
		</div>
	);
}
