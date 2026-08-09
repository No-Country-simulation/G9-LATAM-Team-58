import type { ChangeEvent, DragEvent } from 'react';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { cn } from '@/shared/lib/utils';
import { downloadTemplate } from '../format';

interface BatchDropzoneProps {
	isDragging: boolean;
	onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
	onDragOver: (event: DragEvent<HTMLDivElement>) => void;
	onDragLeave: () => void;
	onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

const FILE_INPUT_ID = 'batch-csv-file-input';

export function BatchDropzone({
	isDragging,
	onFileChange,
	onDragEnter,
	onDragOver,
	onDragLeave,
	onDrop
}: BatchDropzoneProps) {
	return (
		<div
			className={cn(
				'flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center transition-colors',
				isDragging ? 'border-primary bg-primary/6' : 'border-outline bg-card hover:border-primary/70 hover:bg-muted/40'
			)}
			onDragEnter={onDragEnter}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		>
			{/* `display: contents` keeps these children direct flex items of the
			    container above while still giving the whole cluster one native control. */}
			<label htmlFor={FILE_INPUT_ID} className="contents cursor-pointer">
				<input id={FILE_INPUT_ID} type="file" accept=".csv,text/csv" className="sr-only" onChange={onFileChange} />
				<div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
					<IconUpload className="size-6" />
				</div>
				<p className="mt-4 font-heading font-semibold">Arrastra tu archivo CSV aquí</p>
				<p className="mt-1 text-sm text-muted-foreground">o selecciona un archivo desde tu equipo</p>
				<span className="mt-5 inline-flex rounded-md border px-3 py-2 text-sm font-medium">Seleccionar archivo</span>
				<p className="mt-3 text-xs text-muted-foreground">Hasta 5 MB · hasta 2.000 filas</p>
			</label>
			<button
				type="button"
				className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
				onClick={downloadTemplate}
			>
				<IconDownload className="size-3.5" />
				Descargar plantilla
			</button>
		</div>
	);
}
