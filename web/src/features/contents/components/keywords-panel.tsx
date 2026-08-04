import { KeywordChips, SectionHeading } from '@/components/data-display';
import { Card, CardContent } from '@/components/ui/card';

export function KeywordsPanel({ keywords }: { keywords: string[] }) {
	if (keywords.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<SectionHeading>Palabras clave</SectionHeading>
				<KeywordChips keywords={keywords} />
			</CardContent>
		</Card>
	);
}
