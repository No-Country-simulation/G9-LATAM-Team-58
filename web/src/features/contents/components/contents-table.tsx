import { Link, useNavigate } from 'react-router';
import { CategoryBadge } from '@/components/data-display';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ContentSummary } from '@/shared/api/contracts';
import { formatDateTime } from '@/shared/lib/format';

interface ContentsTableProps {
	items: ContentSummary[];
}

export function ContentsTable({ items }: ContentsTableProps) {
	const navigate = useNavigate();

	return (
		<div className="overflow-hidden rounded-md border border-outline bg-card">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="font-mono text-[11px] tracking-[0.06em] uppercase">Título</TableHead>
						<TableHead className="font-mono text-[11px] tracking-[0.06em] uppercase">Categoría</TableHead>
						<TableHead className="font-mono text-[11px] tracking-[0.06em] uppercase">Fuente</TableHead>
						<TableHead className="font-mono text-[11px] tracking-[0.06em] uppercase">Idioma</TableHead>
						<TableHead className="text-right font-mono text-[11px] tracking-[0.06em] uppercase">Fecha</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map(content => (
						<TableRow key={content.id} className="cursor-pointer" onClick={() => navigate(`/contenidos/${content.id}`)}>
							<TableCell className="max-w-[320px] truncate font-medium text-foreground" title={content.title}>
								<Link to={`/contenidos/${content.id}`} onClick={event => event.stopPropagation()}>
									{content.title}
								</Link>
							</TableCell>
							<TableCell>
								<CategoryBadge category={content.category} />
							</TableCell>
							<TableCell className="text-muted-foreground">{content.source}</TableCell>
							<TableCell className="font-mono text-[12px] text-muted-foreground uppercase">
								{content.language}
							</TableCell>
							<TableCell className="text-right font-mono text-[12px] text-text-dim tabular-nums">
								{formatDateTime(content.addedAt)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
