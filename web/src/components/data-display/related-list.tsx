import { Link } from 'react-router';
import type { RelatedItem } from '@/shared/api/contracts';
import { formatCosine } from '@/shared/lib/format';
import { CategoryDot } from './category-dot';

export function RelatedList({ related }: { related: RelatedItem[] }) {
	return (
		<ul className="flex flex-col divide-y">
			{related.map(item => (
				<li key={item.id}>
					<Link
						to={`/contenidos/${item.id}`}
						className="flex items-center justify-between gap-3 px-2 py-3 transition-colors hover:bg-accent"
					>
						<span className="flex min-w-0 flex-col gap-1">
							<span className="truncate text-sm text-foreground">{item.title}</span>
							<span className="flex items-center gap-1.5 font-mono text-[11px] text-text-dim">
								<CategoryDot category={item.category} />
								{item.category} · id {item.id}
							</span>
						</span>
						<span className="shrink-0 font-mono text-[13px] tabular-nums text-muted-foreground">
							{formatCosine(item.similarity)}
						</span>
					</Link>
				</li>
			))}
		</ul>
	);
}
