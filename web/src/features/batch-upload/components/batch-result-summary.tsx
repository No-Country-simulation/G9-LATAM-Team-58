import { IconCircleCheck } from '@tabler/icons-react';
import { Metric } from '@/components/data-display';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import type { BatchUploadResponse } from '@/shared/api/contracts';
import { formatDuration } from '../format';

// Metric's value span always renders `text-foreground`; wrapping the value in
// its own colored span is how callers override that (see components/data-display/metric.tsx).

interface BatchResultSummaryProps {
	result: BatchUploadResponse;
	elapsedSeconds: number;
	onReset: () => void;
}

export function BatchResultSummary({ result, elapsedSeconds, onReset }: BatchResultSummaryProps) {
	const total = result.processed + result.failed;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-start gap-3 rounded-md border border-success/30 bg-success/10 p-4">
				<IconCircleCheck className="mt-0.5 size-5 shrink-0 text-success" />
				<div>
					<h3 className="font-heading text-sm font-semibold text-foreground">Carga completada</h3>
					<p className="mt-1 text-[13px] text-muted-foreground">
						{result.processed.toLocaleString('es')} contenidos clasificados y añadidos a la biblioteca.
					</p>
				</div>
			</div>

			<div className="grid gap-3 rounded-md border bg-card p-6 sm:grid-cols-4">
				<Metric label="Procesados">{total.toLocaleString('es')}</Metric>
				<Metric label="Clasificadas">
					<span className="text-success">{result.processed.toLocaleString('es')}</span>
				</Metric>
				<Metric label="Con error">
					<span className={result.failed > 0 ? 'text-destructive' : 'text-muted-foreground'}>
						{result.failed.toLocaleString('es')}
					</span>
				</Metric>
				<Metric label="Tiempo">{formatDuration(elapsedSeconds)}</Metric>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onReset}>
					Cargar otro CSV
				</Button>
				<Button asChild data-icon="inline-end">
					<Link to="/contenidos">Ver en la biblioteca</Link>
				</Button>
			</div>
		</div>
	);
}
