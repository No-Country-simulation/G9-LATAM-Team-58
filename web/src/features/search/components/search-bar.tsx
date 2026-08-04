import { SEARCH_MODES, type SearchMode } from '@/shared/config/constants';

interface SearchBarProps {
	query: string;
	mode: SearchMode;
	isSearching: boolean;
	onQueryChange: (query: string) => void;
	onModeChange: (mode: SearchMode) => void;
}

export function SearchBar({ query, mode, isSearching, onQueryChange, onModeChange }: SearchBarProps) {
	return (
		<div className="stack" role="search">
			<input
				type="search"
				className="input"
				placeholder="Buscar por significado o por palabra clave…"
				value={query}
				onChange={event => onQueryChange(event.target.value)}
				aria-label="Término de búsqueda"
			/>
			<div className="row">
				{SEARCH_MODES.map(({ value, label }) => (
					<button
						key={value}
						type="button"
						className={mode === value ? 'btn btn--primary' : 'btn'}
						aria-pressed={mode === value}
						onClick={() => onModeChange(value)}
					>
						{label}
					</button>
				))}
				{isSearching && <span className="muted">Buscando…</span>}
			</div>
		</div>
	);
}
