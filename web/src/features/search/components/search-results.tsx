import { IconArrowRight, IconCompass, IconSearchOff } from '@tabler/icons-react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/data-display';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { Button } from '@/components/ui/button';
import type { ApiError } from '@/shared/api/client';
import type { SearchResponse } from '@/shared/api/contracts';
import type { SearchMode } from '@/shared/config/constants';
import { DEFAULT_SEARCH_PAGE_SIZE } from '../api';
import { ExampleQueries } from './example-queries';
import { ResultCard } from './result-card';
import { ResultsSkeleton } from './results-skeleton';
import { SearchMeta } from './search-meta';
import { SearchPagination } from './search-pagination';

interface SearchResultsProps {
	hasQuery: boolean;
	isPending: boolean;
	error: ApiError | null;
	data: SearchResponse | null;
	mode: SearchMode;
	page: number;
	onRetry: () => void;
	onExampleSelect: (query: string) => void;
	onClearFilters: () => void;
	onPageChange: (page: number) => void;
}

/** Routes the five states of the results area; each one owns its layout. */
export function SearchResults({
	hasQuery,
	isPending,
	error,
	data,
	mode,
	page,
	onRetry,
	onExampleSelect,
	onClearFilters,
	onPageChange
}: SearchResultsProps) {
	if (!hasQuery) {
		return (
			<div className="flex flex-col gap-10">
				<EmptyState
					icon={IconCompass}
					title="Empieza una búsqueda"
					description="Escribe una idea, no palabras exactas: el modelo busca por significado."
				/>
				<div>
					<h4 className="mb-3 font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
						Búsquedas de ejemplo
					</h4>
					<ExampleQueries onSelect={onExampleSelect} />
				</div>
			</div>
		);
	}

	if (isPending) {
		return <ResultsSkeleton />;
	}

	if (error) {
		return (
			<div className="flex flex-col gap-6">
				<ErrorBanner title="El servicio de búsqueda no responde" error={error} onRetry={onRetry} />
				<EmptyState
					icon={IconSearchOff}
					title="Búsqueda no disponible"
					description="Puedes seguir consultando la biblioteca mientras se restablece el servicio."
				>
					<Button asChild variant="outline" data-icon="inline-end">
						<Link to="/contenidos">
							Ir a la biblioteca
							<IconArrowRight />
						</Link>
					</Button>
				</EmptyState>
			</div>
		);
	}

	if (!data) {
		return null;
	}

	if (data.results.length === 0) {
		return (
			<div className="flex flex-col gap-4">
				<SearchMeta count={0} elapsedMs={data.elapsedMs} showElapsed={mode === 'semantic'} />
				<EmptyState
					icon={IconSearchOff}
					title="Sin coincidencias"
					description="Ningún documento supera el umbral de similitud para esta consulta. Prueba con términos más técnicos o quita filtros."
				>
					<Button type="button" variant="outline" onClick={onClearFilters}>
						Limpiar filtros
					</Button>
					<Button asChild variant="outline" data-icon="inline-end">
						<Link to="/contenidos">
							Ver toda la biblioteca
							<IconArrowRight />
						</Link>
					</Button>
				</EmptyState>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<SearchMeta count={data.results.length} elapsedMs={data.elapsedMs} showElapsed={mode === 'semantic'} />
			<div className="flex flex-col gap-3">
				{data.results.map(result => (
					<ResultCard key={result.id} result={result} showSimilarity={mode === 'semantic'} />
				))}
			</div>
			<SearchPagination
				page={page}
				canGoNext={data.results.length === DEFAULT_SEARCH_PAGE_SIZE}
				onPageChange={onPageChange}
			/>
		</div>
	);
}
