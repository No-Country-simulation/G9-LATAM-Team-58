import type { ChangeEvent, DragEvent } from 'react';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { cn } from '@/shared/lib/utils';
import { downloadTemplate } from '../format';

interface BatchDropzoneProps {
	isDragging: boolean;
	onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDragEnter: (event: DragEvent<HTMLLabelElement>) => void;
	onDragOver: (event: DragEvent<HTMLLabelElement>) => void;
	onDragLeave: () => void;
	onDrop: (event: DragEvent<HTMLLabelElement>) => void;
}

export function BatchDropzone({
	isDragging,
	onFileChange,
	onDragEnter,
	onDragOver,
	onDragLeave,
	onDrop
}: BatchDropzoneProps) {
	return (
		<label
			className={cn(
				'flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-8 text-center transition-colors',
				isDragging ? 'border-primary bg-primary/6' : 'border-outline bg-card hover:border-primary/70 hover:bg-muted/40'
			)}
			onDragEnter={onDragEnter}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		>
			<input type="file" accept=".csv,text/csv" className="sr-only" onChange={onFileChange} />
			<div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
				<IconUpload className="size-6" />
			</div>
			<p className="mt-4 font-heading font-semibold">Arrastra tu archivo CSV aquí</p>
			<p className="mt-1 text-sm text-muted-foreground">o selecciona un archivo desde tu equipo</p>
			<span className="mt-5 inline-flex rounded-md border px-3 py-2 text-sm font-medium">Seleccionar archivo</span>
			<p className="mt-3 text-xs text-muted-foreground">Hasta 5 MB · hasta 2.000 filas</p>
			<button
				type="button"
				className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
				onClick={event => {
					event.preventDefault();
					event.stopPropagation();
					downloadTemplate();
				}}
			>
				<IconDownload className="size-3.5" />
				Descargar plantilla
			</button>
		</label>
	);
}
