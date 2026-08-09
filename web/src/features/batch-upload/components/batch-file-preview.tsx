import { IconFileText, IconUpload, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '../format';
import type { ParsedCsv } from '../parse-csv';

interface BatchFilePreviewProps {
	file: File;
	parsed: ParsedCsv;
	isPending: boolean;
	onRemove: () => void;
	onUpload: () => void;
}

const PREVIEW_ROWS = 5;

export function BatchFilePreview({ file, parsed, isPending, onRemove, onUpload }: BatchFilePreviewProps) {
	const previewRows = parsed.rows.slice(0, PREVIEW_ROWS);

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col justify-between gap-4 rounded-md border bg-card p-4 sm:flex-row sm:items-center">
				<div className="flex min-w-0 items-center gap-3">
					<IconFileText className="size-5 shrink-0 text-primary" />
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{file.name}</p>
						<p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
							{formatFileSize(file.size)} · {parsed.totalRows.toLocaleString('es')} filas
						</p>
					</div>
				</div>
				<Button type="button" variant="ghost" size="icon" aria-label="Quitar archivo" onClick={onRemove}>
					<IconX />
				</Button>
			</div>

			<div className="overflow-hidden rounded-md border bg-card">
				<div className="border-b px-5 py-3">
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
						Vista previa · primeras {previewRows.length} filas
					</p>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="border-b font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
							<tr>
								<th className="w-10 px-5 py-3 font-medium">#</th>
								<th className="px-5 py-3 font-medium">Título</th>
								<th className="px-5 py-3 font-medium">Texto</th>
							</tr>
						</thead>
						<tbody>
							{/* CSV rows carry no id and this slice never reorders or filters, so the index is a safe key. */}
							{previewRows.map((row, index) => (
								<tr key={index} className="border-b last:border-0">
									<td className="px-5 py-3 font-mono text-xs tabular-nums text-muted-foreground">{index + 1}</td>
									<td className="max-w-56 truncate px-5 py-3 font-medium">{row.title}</td>
									<td className="max-w-96 truncate px-5 py-3 text-muted-foreground">{row.body}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className="border-t px-5 py-3 text-sm text-muted-foreground">
					Se detectaron {parsed.totalRows.toLocaleString('es')} filas válidas. La categoría de cada fila la asigna el
					modelo.
				</p>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onRemove}>
					Cancelar
				</Button>
				<Button type="button" disabled={isPending} onClick={onUpload} data-icon="inline-end">
					Procesar {parsed.totalRows.toLocaleString('es')} filas
					<IconUpload />
				</Button>
			</div>
		</section>
	);
}
