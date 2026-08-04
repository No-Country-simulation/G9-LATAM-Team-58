import { useParams } from 'react-router';
import { ErrorBanner } from '@/components/feedback/error-banner';
import {
	ClassificationPanel,
	DetailBody,
	DetailHeader,
	DetailSkeleton,
	KeywordsPanel,
	ModelInfo,
	RelatedPanel,
	useContent,
	useRelatedContents
} from '@/features/contents';

export function ContentDetailPage() {
	const { id = '' } = useParams();
	const content = useContent(id);
	const related = useRelatedContents(id);

	if (content.isPending) {
		return <DetailSkeleton />;
	}

	if (content.isError) {
		return (
			<ErrorBanner title="No se pudo cargar el contenido" error={content.error} onRetry={() => content.refetch()} />
		);
	}

	const detail = content.data;

	return (
		<div className="mx-auto flex w-full max-w-300 flex-col gap-6 pt-6 pb-20">
			<DetailHeader detail={detail} />

			<div className="flex flex-row items-start gap-6">
				<div className="w-2/3">
					<DetailBody body={detail.body} />
				</div>
				<aside className="flex w-1/3 flex-col gap-4">
					<ClassificationPanel category={detail.category} probability={detail.probability} />
					<KeywordsPanel keywords={detail.keywords} />
					<RelatedPanel isPending={related.isPending} error={related.error} related={related.data?.related ?? null} />
					<ModelInfo />
				</aside>
			</div>
		</div>
	);
}
