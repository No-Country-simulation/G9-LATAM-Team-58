import type { UseQueryResult } from '@tanstack/react-query';
import { Link } from 'react-router';
import { CategoryBadge } from '@/components/data-display';
import { ApiError } from '@/shared/api/client';
import type { SearchResponse } from '@/shared/api/contracts';
import { formatSimilarity } from '@/shared/lib/format';

interface SearchResultsProps {
	search: UseQueryResult<SearchResponse, ApiError>;
	hasQuery: boolean;
}

export function SearchResults({ search, hasQuery }: SearchResultsProps) {
	if (!hasQuery) {
		return <p className="muted">Escribe algo para buscar en la base de conocimiento.</p>;
	}

	if (search.isPending) {
		return <p className="muted">Buscando…</p>;
	}

	if (search.isError) {
		return <p className="error-text">{search.error.message}</p>;
	}

	const { results, mode, elapsedMs } = search.data;

	if (results.length === 0) {
		return <p className="muted">Sin resultados. Prueba con otros términos o cambia de modo.</p>;
	}

	return (
		<div className="stack">
			<p className="muted">
				{results.length} resultados
				{/* elapsedMs is only real in semantic mode; keyword hardcodes it to 0 */}
				{mode === 'semantic' && ` en ${elapsedMs} ms`}
			</p>
			<ul className="result-list">
				{results.map(result => (
					<li key={result.id} className="card result-item">
						<Link to={`/contenidos/${result.id}`}>{result.title}</Link>
						<span className="row">
							<CategoryBadge category={result.category} />
							{/* keyword mode has no ranking: similarity is fixed at 1.0, so hide it */}
							{mode === 'semantic' && <span className="muted">{formatSimilarity(result.similarity)}</span>}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
