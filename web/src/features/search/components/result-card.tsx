import { Link } from 'react-router';
import { CategoryBadge } from '@/components/data-display';
import type { SearchResult } from '@/shared/api/contracts';
import { formatCosine } from '@/shared/lib/format';

interface ResultCardProps {
	result: SearchResult;
	showSimilarity: boolean;
}

export function ResultCard({ result, showSimilarity }: ResultCardProps) {
	return (
		<Link
			to={`/contenidos/${result.id}`}
			className="group flex flex-col gap-2 rounded-md border border-outline bg-card p-4 transition-colors hover:bg-accent"
		>
			<div className="flex items-center justify-between gap-3">
				<CategoryBadge category={result.category} />
				{showSimilarity && (
					<span className="font-mono text-[13px] tabular-nums text-muted-foreground">
						{formatCosine(result.similarity)}
					</span>
				)}
			</div>
			<h3 className="font-heading text-[15px] font-semibold text-foreground transition-colors group-hover:text-primary">
				{result.title}
			</h3>
		</Link>
	);
}
