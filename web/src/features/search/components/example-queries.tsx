import { IconArrowUpRight } from '@tabler/icons-react';
import { EXAMPLE_QUERIES } from '../example-queries';

interface ExampleQueriesProps {
	onSelect: (query: string) => void;
}

/** Sample queries that run a search in one click, for demos and first runs. */
export function ExampleQueries({ onSelect }: ExampleQueriesProps) {
	return (
		<div className="flex flex-wrap gap-3">
			{EXAMPLE_QUERIES.map(query => (
				<button
					key={query}
					type="button"
					onClick={() => onSelect(query)}
					className="group flex items-center gap-2 rounded-full border border-outline bg-card px-4 py-2 font-body text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					{query}
					<IconArrowUpRight className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
				</button>
			))}
		</div>
	);
}
