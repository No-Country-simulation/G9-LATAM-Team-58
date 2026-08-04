import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination';

interface ContentsPaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

type PageToken = number | 'ellipsis';

// Always shows the first, the last, and a window of one page around the
// current one, collapsing everything else into a single ellipsis per gap.
function buildPageTokens(page: number, totalPages: number): PageToken[] {
	const tokens: PageToken[] = [];
	const window = new Set([0, totalPages - 1, page - 1, page, page + 1]);

	let previous = -2;
	for (let index = 0; index < totalPages; index++) {
		if (!window.has(index)) {
			continue;
		}
		if (index - previous > 1) {
			tokens.push('ellipsis');
		}
		tokens.push(index);
		previous = index;
	}
	return tokens;
}

export function ContentsPagination({ page, totalPages, onPageChange }: ContentsPaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const tokens = buildPageTokens(page, totalPages);

	return (
		<Pagination className="justify-end">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						text="Anterior"
						href="#"
						aria-disabled={page === 0}
						className={page === 0 ? 'pointer-events-none opacity-50' : undefined}
						onClick={event => {
							event.preventDefault();
							if (page > 0) {
								onPageChange(page - 1);
							}
						}}
					/>
				</PaginationItem>

				{tokens.map((token, index) =>
					token === 'ellipsis' ? (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={token}>
							<PaginationLink
								href={`?page=${token + 1}`}
								isActive={token === page}
								onClick={event => {
									event.preventDefault();
									onPageChange(token);
								}}
							>
								{token + 1}
							</PaginationLink>
						</PaginationItem>
					)
				)}

				<PaginationItem>
					<PaginationNext
						text="Siguiente"
						href="#"
						aria-disabled={page >= totalPages - 1}
						className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : undefined}
						onClick={event => {
							event.preventDefault();
							if (page < totalPages - 1) {
								onPageChange(page + 1);
							}
						}}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
