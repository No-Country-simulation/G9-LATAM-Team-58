import { Metric, SegmentedBar } from '@/components/data-display';
import { useElapsedSeconds } from '@/shared/hooks/use-elapsed-seconds';
import { formatDuration, formatRate } from '../format';

interface BatchProcessingPanelProps {
	progress: number;
	totalRows: number;
}

export function BatchProcessingPanel({ progress, totalRows }: BatchProcessingPanelProps) {
	const elapsed = useElapsedSeconds();
	const processed = Math.round((progress / 100) * totalRows);
	const rate = elapsed > 0 ? processed / elapsed : 0;
	const remaining = rate > 0 ? (totalRows - processed) / rate : 0;

	return (
		<section className="rounded-md border bg-card p-6">
			<div className="flex items-start justify-between gap-4">
				<p className="font-heading text-lg font-semibold">Clasificando contenido</p>
				<Metric label="Filas" align="end">
					{processed.toLocaleString('es')} / {totalRows.toLocaleString('es')}
				</Metric>
			</div>

			<SegmentedBar value={progress / 100} className="mt-6" />

			<div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
				<Metric label="Procesadas">{processed.toLocaleString('es')}</Metric>
				<Metric label="Velocidad">{formatRate(rate)}</Metric>
				<Metric label="Restante">{formatDuration(remaining)}</Metric>
			</div>
		</section>
	);
}
