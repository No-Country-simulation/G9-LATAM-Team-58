import { useStats } from '@/features/dashboard';
import { PageHeader } from '@/components/layout/page-header';
import {
	CategoryChips,
	ContentsPanel,
	ContentsToolbar,
	DEFAULT_CONTENTS_PAGE_SIZE,
	useContents,
	useContentsParamsState
} from '@/features/contents';
import { useDebounce } from '@/shared/hooks/use-debounce';

export function ContentsPage() {
	const params = useContentsParamsState();
	const stats = useStats();
	const debouncedQuery = useDebounce(params.q);
	const hasFilters = params.q.trim().length > 0 || params.category !== undefined;

	const contents = useContents({
		category: params.category,
		q: debouncedQuery,
		sort: 'added_at',
		page: params.page,
		size: DEFAULT_CONTENTS_PAGE_SIZE
	});

	return (
		<div className="mx-auto flex w-full max-w-300 flex-col gap-6 pt-8 pb-20">
			<PageHeader
				title="Biblioteca"
				description={stats.data && `${stats.data.total.toLocaleString('es')} documentos clasificados y vectorizados.`}
			/>

			<div className="flex flex-col gap-4">
				<ContentsToolbar
					query={params.q}
					total={contents.data?.total ?? 0}
					page={params.page}
					totalPages={Math.ceil((contents.data?.total ?? 0) / DEFAULT_CONTENTS_PAGE_SIZE)}
					onQueryChange={params.setQuery}
				/>
				{stats.data && (
					<CategoryChips byCategory={stats.data.byCategory} active={params.category} onSelect={params.setCategory} />
				)}
			</div>

			<ContentsPanel
				isPending={contents.isPending}
				error={contents.error}
				data={contents.data ?? null}
				hasFilters={hasFilters}
				page={params.page}
				onRetry={() => contents.refetch()}
				onPageChange={params.setPage}
				onClearFilters={params.clearFilters}
			/>
		</div>
	);
}
