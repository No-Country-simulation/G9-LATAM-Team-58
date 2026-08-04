import { useState } from 'react';
import { Link } from 'react-router';
import { CategoryBadge } from '@/components/data-display';
import { useContents } from '@/features/contents';
import { CATEGORIES } from '@/shared/config/constants';
import { formatDateTime } from '@/shared/lib/format';

const PAGE_SIZE = 20;

export function ContentsPage() {
	const [category, setCategory] = useState('');
	const [page, setPage] = useState(0);

	const contents = useContents({
		category: category || undefined,
		sort: 'added_at',
		page,
		size: PAGE_SIZE
	});

	function handleCategoryChange(value: string) {
		setCategory(value);
		setPage(0);
	}

	return (
		<div className="stack">
			<h1>Biblioteca</h1>

			<div className="row">
				<label htmlFor="category-filter" className="muted">
					Categoría
				</label>
				<select
					id="category-filter"
					className="select"
					style={{ width: 'auto' }}
					value={category}
					onChange={event => handleCategoryChange(event.target.value)}
				>
					<option value="">Todas</option>
					{CATEGORIES.map(cat => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
			</div>

			{contents.isPending && <p className="muted">Cargando…</p>}
			{contents.isError && <p className="error-text">{contents.error.message}</p>}

			{contents.isSuccess && (
				<>
					{contents.data.length === 0 ? (
						<p className="muted">No hay contenidos con este filtro.</p>
					) : (
						<ul className="result-list">
							{contents.data.map(content => (
								<li key={content.id} className="card result-item">
									<div>
										<Link to={`/contenidos/${content.id}`}>{content.title}</Link>
										<div className="muted">{formatDateTime(content.addedAt)}</div>
									</div>
									<CategoryBadge category={content.category} />
								</li>
							))}
						</ul>
					)}

					{/* The API returns a bare array (no total), so "next" is disabled
					    when the page comes back short. */}
					<div className="row">
						<button type="button" className="btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
							Anterior
						</button>
						<span className="muted">Página {page + 1}</span>
						<button
							type="button"
							className="btn"
							disabled={contents.data.length < PAGE_SIZE}
							onClick={() => setPage(p => p + 1)}
						>
							Siguiente
						</button>
					</div>
				</>
			)}
		</div>
	);
}
