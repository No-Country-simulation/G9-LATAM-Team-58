import { ErrorBanner } from '@/components/feedback/error-banner';
import type { ApiError } from '@/shared/api/client';
import type { ContentListResponse } from '@/shared/api/contracts';
import { DEFAULT_CONTENTS_PAGE_SIZE } from '../api';
import { ContentsEmpty } from './contents-empty';
import { ContentsPagination } from './contents-pagination';
import { ContentsTable } from './contents-table';
import { ContentsTableSkeleton } from './contents-table-skeleton';

interface ContentsPanelProps {
	isPending: boolean;
	error: ApiError | null;
	data: ContentListResponse | null;
	hasFilters: boolean;
	page: number;
	onRetry: () => void;
	onPageChange: (page: number) => void;
	onClearFilters: () => void;
}

/** Routes the four states of the library body; each one owns its layout. */
export function ContentsPanel({
	isPending,
	error,
	data,
	hasFilters,
	page,
	onRetry,
	onPageChange,
	onClearFilters
}: ContentsPanelProps) {
	if (isPending) {
		return <ContentsTableSkeleton />;
	}

	if (error) {
		return <ErrorBanner title="No se pudo cargar la biblioteca" error={error} onRetry={onRetry} />;
	}

	if (!data || data.items.length === 0) {
		return <ContentsEmpty hasFilters={hasFilters} onClearFilters={onClearFilters} />;
	}

	const totalPages = Math.ceil(data.total / DEFAULT_CONTENTS_PAGE_SIZE);

	return (
		<div className="flex flex-col gap-4">
			<ContentsTable items={data.items} />
			<ContentsPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
		</div>
	);
}
