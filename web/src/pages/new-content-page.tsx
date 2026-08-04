import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useCreateContent } from '@/features/create-content';
import { formatProbability, formatSimilarity } from '@/shared/lib/format';

// Temporary controlled form — will migrate to react-hook-form + zod + shadcn
// Form once the ui kit lands.
export function NewContentPage() {
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const createContent = useCreateContent();

	const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !createContent.isPending;

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!canSubmit) return;
		createContent.mutate({ title: title.trim(), body: body.trim() });
	}

	const result = createContent.data;

	return (
		<div className="stack">
			<h1>Nuevo contenido</h1>

			<form className="stack" onSubmit={handleSubmit}>
				<label className="stack">
					Título
					<input className="input" value={title} onChange={event => setTitle(event.target.value)} required />
				</label>
				<label className="stack">
					Cuerpo
					<textarea className="textarea" value={body} onChange={event => setBody(event.target.value)} required />
				</label>
				<div className="row">
					<button type="submit" className="btn btn--primary" disabled={!canSubmit}>
						{createContent.isPending ? 'Clasificando…' : 'Guardar y clasificar'}
					</button>
					{createContent.isError && <span className="error-text">{createContent.error.message}</span>}
				</div>
			</form>

			{result && (
				<section className="card stack">
					<h2>Clasificado como {result.category}</h2>
					<p className="muted">
						Confianza {formatProbability(result.probability)}
						{result.keywords.length > 0 && ` · Palabras clave: ${result.keywords.join(', ')}`}
					</p>
					{result.related.length > 0 && (
						<>
							<h3>Ya relacionado con</h3>
							<ul className="result-list">
								{result.related.map(item => (
									<li key={item.id} className="result-item">
										<Link to={`/contenidos/${item.id}`}>{item.title}</Link>
										<span className="muted">{formatSimilarity(item.similarity)}</span>
									</li>
								))}
							</ul>
						</>
					)}
					<div className="row">
						<Link className="btn" to={`/contenidos/${result.id}`}>
							Ver detalle
						</Link>
						<button
							type="button"
							className="btn"
							onClick={() => {
								setTitle('');
								setBody('');
								createContent.reset();
							}}
						>
							Añadir otro
						</button>
					</div>
				</section>
			)}
		</div>
	);
}
