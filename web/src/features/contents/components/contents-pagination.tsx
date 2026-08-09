import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination';
import { buildPageTokens } from '../pagination-tokens';

interface ContentsPaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
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
					// An ellipsis is always followed by a real page number, so that
					// neighbor gives it a key stable across re-renders instead of its index.
					token === 'ellipsis' ? (
						<PaginationItem key={`ellipsis-before-${tokens[index + 1]}`}>
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
