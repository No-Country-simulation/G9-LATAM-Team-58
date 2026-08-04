import { useStats } from '@/features/dashboard';
import { SearchBar, SearchFilters, SearchResults, useSearch, useSearchParamsState } from '@/features/search';
import { useDebounce } from '@/shared/hooks/use-debounce';

export function SearchPage() {
	const params = useSearchParamsState();
	const stats = useStats();
	const debouncedQuery = useDebounce(params.query);
	const hasQuery = debouncedQuery.trim().length > 0;

	const search = useSearch({
		query: debouncedQuery,
		mode: params.mode,
		category: params.category,
		page: params.page
	});

	return (
		<div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 pt-8 pb-20">
			<header className="flex flex-col items-center gap-2 text-center">
				<h1>Buscar en la base de conocimiento</h1>
				{stats.data && (
					<p className="text-sm text-muted-foreground">
						Búsqueda semántica sobre <span className="font-mono text-foreground tabular-nums">{stats.data.total}</span>{' '}
						documentos vectorizados.
					</p>
				)}
			</header>

			<SearchBar
				value={params.query}
				isSearching={search.isFetching}
				onChange={params.setQuery}
				onSubmit={() => undefined}
				onClear={() => params.setQuery('')}
			/>

			<SearchFilters
				mode={params.mode}
				category={params.category}
				onModeChange={params.setMode}
				onCategoryChange={params.setCategory}
			/>

			<SearchResults
				hasQuery={hasQuery}
				isPending={search.isPending}
				error={search.error}
				data={search.data ?? null}
				mode={params.mode}
				page={params.page}
				onRetry={() => search.refetch()}
				onExampleSelect={params.setQuery}
				onClearFilters={params.clearFilters}
				onPageChange={params.setPage}
			/>
		</div>
	);
}
