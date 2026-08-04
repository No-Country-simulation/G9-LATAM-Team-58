import { CategoryBadge, ConfidenceBar, Metric, SectionHeading } from '@/components/data-display';
import { Card, CardContent } from '@/components/ui/card';
import { formatProbability } from '@/shared/lib/format';

export function ClassificationPanel({ category, probability }: { category: string; probability: number }) {
	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<SectionHeading>Clasificación</SectionHeading>
				<CategoryBadge category={category} />
				<Metric label="Confianza">{formatProbability(probability)}</Metric>
				<ConfidenceBar value={probability} />
			</CardContent>
		</Card>
	);
}
