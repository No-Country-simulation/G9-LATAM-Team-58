import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORIES, SEARCH_MODES, type SearchMode } from '@/shared/config/constants';

interface SearchFiltersProps {
	mode: SearchMode;
	category: string | undefined;
	onModeChange: (mode: SearchMode) => void;
	onCategoryChange: (category: string | undefined) => void;
}

const ALL_CATEGORIES = 'all';

/**
 * In keyword mode the backend concatenates the category to the query text
 * instead of filtering by column (contract §3.6), so it narrows results
 * rather than strictly filtering them. The select stays enabled either way —
 * hiding it would be more surprising than the imprecise match.
 */
export function SearchFilters({ mode, category, onModeChange, onCategoryChange }: SearchFiltersProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
			<Tabs value={mode} onValueChange={value => onModeChange(value as SearchMode)}>
				<TabsList>
					{SEARCH_MODES.map(({ value, label }) => (
						<TabsTrigger key={value} value={value}>
							{label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<Select
				value={category ?? ALL_CATEGORIES}
				onValueChange={value => onCategoryChange(value === ALL_CATEGORIES ? undefined : value)}
			>
				<SelectTrigger aria-label="Filtrar por categoría">
					<SelectValue placeholder="Todas las categorías" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
					{CATEGORIES.map(item => (
						<SelectItem key={item} value={item}>
							{item}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
