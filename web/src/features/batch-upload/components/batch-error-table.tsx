import { IconAlertTriangle } from '@tabler/icons-react';
import type { BatchUploadResponse } from '@/shared/api/contracts';

interface BatchErrorTableProps {
	errors: BatchUploadResponse['errors'];
}

export function BatchErrorTable({ errors }: BatchErrorTableProps) {
	if (errors.length === 0) return null;

	return (
		<div className="rounded-md border bg-card p-5">
			<div className="flex items-center gap-2">
				<IconAlertTriangle className="size-4 text-destructive" />
				<p className="font-heading text-sm font-semibold">
					{errors.length.toLocaleString('es')}{' '}
					{errors.length === 1 ? 'fila no se pudo procesar' : 'filas no se pudieron procesar'}
				</p>
			</div>
			<ul className="mt-4 flex flex-col gap-1.5 font-mono text-xs">
				{errors.map((error, index) => (
					<li key={`${error.row}-${error.reason}`} className="text-muted-foreground">
						<span className="text-text-dim">{String(index + 1).padStart(2, '0')}</span>{' '}
						<span className="tabular-nums">fila {error.row}</span> · {error.reason}
					</li>
				))}
			</ul>
		</div>
	);
}
