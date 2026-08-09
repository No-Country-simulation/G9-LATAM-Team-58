import { SectionHeading } from '@/components/data-display';
import { Card, CardContent } from '@/components/ui/card';

export function DetailBody({ body }: { body: string }) {
	const paragraphs = body.split(/\n+/).filter(paragraph => paragraph.trim().length > 0);

	return (
		<Card>
			<CardContent className="flex flex-col gap-5">
				<SectionHeading>Texto</SectionHeading>
				<div className="flex flex-col gap-5 text-[15px] leading-[26px] text-foreground">
					{/* Paragraphs are re-split from `body` on every render in the same order, so the index is a safe key. */}
					{paragraphs.map((paragraph, index) => (
						<p key={index}>{paragraph}</p>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
