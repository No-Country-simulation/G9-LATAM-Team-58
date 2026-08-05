import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface SearchPaginationProps {
	page: number;
	canGoNext: boolean;
	onPageChange: (page: number) => void;
}

/**
 * `total` in the search response is the page size, not the overall hit
 * count, so there is no way to render numbered pages —
 * "Siguiente" only enables when the current page is full.
 */
export function SearchPagination({ page, canGoNext, onPageChange }: SearchPaginationProps) {
	return (
		<div className="flex items-center justify-center gap-4 pt-2">
			<Button
				type="button"
				variant="outline"
				size="sm"
				data-icon="inline-start"
				disabled={page === 0}
				onClick={() => onPageChange(page - 1)}
			>
				<IconChevronLeft />
				Anterior
			</Button>
			<span className="font-mono text-[11px] text-text-dim tabular-nums">página {page + 1}</span>
			<Button
				type="button"
				variant="outline"
				size="sm"
				data-icon="inline-end"
				disabled={!canGoNext}
				onClick={() => onPageChange(page + 1)}
			>
				Siguiente
				<IconChevronRight />
			</Button>
		</div>
	);
}
