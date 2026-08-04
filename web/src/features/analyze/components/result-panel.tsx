import { Link } from 'react-router';
import { IconArrowRight } from '@tabler/icons-react';
import {
	CategoryBadge,
	ConfidenceBar,
	KeywordChips,
	Metric,
	RelatedList,
	SectionHeading
} from '@/components/data-display';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { ApiError } from '@/shared/api/client';
import type { IngestionResponse } from '@/shared/api/contracts';
import { formatProbability } from '@/shared/lib/format';
import { EmptyPlaceholder } from './empty-placeholder';
import { ExplanationList } from './explanation-list';
import { ProcessingPanel } from './processing-panel';

interface ResultPanelProps {
	isPending: boolean;
	error: ApiError | null;
	data: IngestionResponse | null;
	onRetry: () => void;
}

/** Routes the four states of the right-hand column; each one owns its layout. */
export function ResultPanel({ isPending, error, data, onRetry }: ResultPanelProps) {
	if (isPending) {
		return <ProcessingPanel />;
	}

	if (error) {
		return (
			<Card className="flex-1">
				<CardContent className="flex flex-1 flex-col gap-6">
					<ErrorBanner title="No se pudo analizar el contenido" error={error} onRetry={onRetry} />
					<EmptyPlaceholder description="Corrige el texto y vuelve a intentarlo." />
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return (
			<Card className="flex-1">
				<CardContent className="flex flex-1 flex-col">
					<EmptyPlaceholder />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="flex-1 overflow-y-auto">
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-col items-start gap-2">
						<span className="font-heading text-lg font-semibold text-foreground">Predicción</span>
						<CategoryBadge category={data.category} />
					</div>
					<Metric label="Confianza" align="end">
						{formatProbability(data.probability)}
					</Metric>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-8">
				<ConfidenceBar value={data.probability} />
				{data.keywords.length > 0 && (
					<section>
						<SectionHeading>Palabras clave extraídas</SectionHeading>
						<KeywordChips keywords={data.keywords} />
					</section>
				)}
				{data.explanation.length > 0 && (
					<section>
						<SectionHeading>Explicación del modelo</SectionHeading>
						<ExplanationList explanation={data.explanation} />
					</section>
				)}
				{data.related.length > 0 && (
					<section>
						<SectionHeading>Contenido relacionado</SectionHeading>
						<RelatedList related={data.related} />
					</section>
				)}
			</CardContent>
			<CardFooter className="justify-end">
				<Button asChild>
					<Link to={`/contenidos/${data.id}`} data-icon="inline-end">
						Ver detalle
						<IconArrowRight />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
