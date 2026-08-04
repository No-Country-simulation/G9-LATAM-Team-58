import { IconSearch } from '@tabler/icons-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

interface ContentsToolbarProps {
	query: string;
	total: number;
	page: number;
	totalPages: number;
	onQueryChange: (query: string) => void;
}

export function ContentsToolbar({ query, total, page, totalPages, onQueryChange }: ContentsToolbarProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-outline bg-card p-2">
			<InputGroup className="max-w-[280px]">
				<InputGroupInput
					value={query}
					onChange={event => onQueryChange(event.target.value)}
					placeholder="Filtrar por título"
					aria-label="Filtrar por título"
				/>
				<InputGroupAddon>
					<IconSearch />
				</InputGroupAddon>
			</InputGroup>
			<span className="font-mono text-[11px] tracking-[0.06em] text-text-dim uppercase tabular-nums">
				{total} registro{total === 1 ? '' : 's'} · página {page + 1} de {Math.max(totalPages, 1)}
			</span>
		</div>
	);
}
