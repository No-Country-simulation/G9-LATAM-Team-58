import { useState } from 'react';
import { SearchBar, SearchResults, useSearch } from '@/features/search';
import { useDebounce } from '@/shared/hooks/use-debounce';
import type { SearchMode } from '@/shared/config/constants';

export function SearchPage() {
	const [query, setQuery] = useState('');
	const [mode, setMode] = useState<SearchMode>('semantic');
	const debouncedQuery = useDebounce(query);

	const search = useSearch({ query: debouncedQuery, mode });

	return (
		<div className="stack">
			<h1>Buscar</h1>
			<SearchBar
				query={query}
				mode={mode}
				isSearching={search.isFetching}
				onQueryChange={setQuery}
				onModeChange={setMode}
			/>
			<SearchResults search={search} hasQuery={debouncedQuery.trim().length > 0} />
		</div>
	);
}
