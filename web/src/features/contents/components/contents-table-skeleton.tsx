import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SKELETON_ROWS = 8;

export function ContentsTableSkeleton() {
	return (
		<div className="overflow-hidden rounded-md border border-outline bg-card" aria-hidden="true">
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
					{Array.from({ length: SKELETON_ROWS }, (_, index) => (
						<TableRow key={index} className="hover:bg-transparent">
							<TableCell>
								<Skeleton className="h-3.5 w-[70%]" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-[18px] w-20 rounded-full" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-3.5 w-16" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-3.5 w-8" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="ml-auto h-3.5 w-16" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
