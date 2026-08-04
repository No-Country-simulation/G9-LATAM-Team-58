import { useState, type ChangeEvent } from 'react';
import { useBatchUpload } from '@/features/batch-upload';

export function BatchPage() {
	const [file, setFile] = useState<File | null>(null);
	const batch = useBatchUpload();

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		setFile(event.target.files?.[0] ?? null);
		batch.reset();
	}

	function handleUpload() {
		if (file && !batch.isPending) {
			batch.mutate(file);
		}
	}

	const result = batch.data;

	return (
		<div className="stack">
			<h1>Carga masiva CSV</h1>
			<p className="muted">
				El archivo debe tener cabecera en la primera línea y dos columnas: <code>title,body</code>. Máximo 5 MB.
			</p>

			<div className="row">
				<input type="file" accept=".csv" onChange={handleFileChange} aria-label="Archivo CSV" />
				<button type="button" className="btn btn--primary" disabled={!file || batch.isPending} onClick={handleUpload}>
					{batch.isPending ? 'Procesando…' : 'Subir'}
				</button>
			</div>

			{batch.isError && <p className="error-text">{batch.error.message}</p>}

			{result && (
				<section className="card stack">
					<h2>
						{result.processed} procesados · {result.failed} con error
					</h2>

					{Object.keys(result.byCategory).length > 0 && (
						<p className="muted">
							{Object.entries(result.byCategory)
								.map(([cat, count]) => `${cat}: ${count}`)
								.join(' · ')}
						</p>
					)}

					{result.errors.length > 0 && (
						<table>
							<thead>
								<tr>
									<th>Fila</th>
									<th>Motivo</th>
								</tr>
							</thead>
							<tbody>
								{result.errors.map(error => (
									<tr key={error.row}>
										<td>{error.row}</td>
										<td>{error.reason}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</section>
			)}
		</div>
	);
}
