import { Link, useParams } from 'react-router';
import { useContent, useRelatedContents } from '@/features/contents';
import { formatDateTime, formatProbability, formatSimilarity } from '@/shared/lib/format';

export function ContentDetailPage() {
	const { id = '' } = useParams();
	const content = useContent(id);
	const related = useRelatedContents(id);

	if (content.isPending) {
		return <p className="muted">Cargando…</p>;
	}

	if (content.isError) {
		return <p className="error-text">{content.error.message}</p>;
	}

	const detail = content.data;

	return (
		<div className="stack">
			<div>
				<span className="badge">{detail.category}</span>
				<h1>{detail.title}</h1>
				<p className="muted">
					{detail.source} · {formatDateTime(detail.addedAt)} · confianza {formatProbability(detail.probability)}
					{detail.url && (
						<>
							{' · '}
							<a href={detail.url} target="_blank" rel="noreferrer">
								Fuente original
							</a>
						</>
					)}
				</p>
			</div>

			<p>{detail.body}</p>

			{detail.keywords.length > 0 && (
				<div className="row">
					{detail.keywords.map(keyword => (
						<span key={keyword} className="badge">
							{keyword}
						</span>
					))}
				</div>
			)}

			<section className="stack">
				<h2>Relacionados</h2>
				{related.isPending && <p className="muted">Cargando…</p>}
				{related.isError && <p className="error-text">{related.error.message}</p>}
				{related.isSuccess && related.data.related.length === 0 && (
					<p className="muted">Todavía no hay contenidos relacionados.</p>
				)}
				{related.isSuccess && related.data.related.length > 0 && (
					<ul className="result-list">
						{related.data.related.map(item => (
							<li key={item.id} className="card result-item">
								<Link to={`/contenidos/${item.id}`}>{item.title}</Link>
								<span className="row">
									<span className="badge">{item.category}</span>
									<span className="muted">{formatSimilarity(item.similarity)}</span>
								</span>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
