import { IconAlertCircle, IconCheck, IconDownload, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { REQUIRED_COLUMNS } from '../constants';
import { downloadTemplate } from '../format';
import type { CsvParseResult } from '../parse-csv';

interface BatchSchemaErrorProps {
	result: Extract<CsvParseResult, { ok: false }>;
	onChooseAnother: () => void;
}

export function BatchSchemaError({ result, onChooseAnother }: BatchSchemaErrorProps) {
	return (
		<section className="flex flex-col gap-4">
			<div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4">
				<IconAlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
				<div className="flex-1">
					<h3 className="font-heading text-sm font-semibold text-foreground">El formato del archivo no es válido</h3>
					<p className="mt-1 text-[13px] text-muted-foreground">
						Se esperaban exactamente las columnas <code className="font-mono">title</code> y{' '}
						<code className="font-mono">body</code>. El archivo contiene otras columnas.
					</p>
					<span className="mt-2 inline-block font-mono text-[11px] tracking-wide text-destructive">
						INVALID_CSV_SCHEMA · 400
					</span>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<div className="rounded-md border bg-card p-4">
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Se esperaba</p>
					<pre className="mt-2 overflow-x-auto rounded-sm border bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
						{result.expected.join(',')}
					</pre>
				</div>
				<div className="rounded-md border bg-card p-4">
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Se recibió</p>
					<pre className="mt-2 overflow-x-auto rounded-sm border bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
						{result.received.length > 0 ? result.received.join(',') : '(sin cabecera)'}
					</pre>
				</div>
			</div>

			<ul className="flex flex-col gap-2 rounded-md border bg-card p-4">
				{REQUIRED_COLUMNS.map(column => {
					const isMissing = result.missing.includes(column);
					return (
						<li key={column} className="flex items-center gap-2 text-sm">
							{isMissing ? (
								<IconX className="size-4 shrink-0 text-destructive" />
							) : (
								<IconCheck className="size-4 shrink-0 text-muted-foreground" />
							)}
							<span className={isMissing ? 'text-destructive' : 'text-muted-foreground'}>
								La columna <code className="font-mono">{column}</code> {isMissing ? 'no existe' : 'se encontró'}
							</span>
						</li>
					);
				})}
			</ul>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" data-icon="inline-start" onClick={downloadTemplate}>
					<IconDownload />
					Descargar plantilla
				</Button>
				<Button type="button" onClick={onChooseAnother}>
					Elegir otro archivo
				</Button>
			</div>
		</section>
	);
}
