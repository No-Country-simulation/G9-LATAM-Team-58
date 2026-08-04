import { SectionHeading } from '@/components/data-display';
import { Card, CardContent } from '@/components/ui/card';

export function DetailBody({ body }: { body: string }) {
	const paragraphs = body.split(/\n+/).filter(paragraph => paragraph.trim().length > 0);

	return (
		<Card>
			<CardContent className="flex flex-col gap-5">
				<SectionHeading>Texto</SectionHeading>
				<div className="flex flex-col gap-5 text-[15px] leading-[26px] text-foreground">
					{paragraphs.map((paragraph, index) => (
						<p key={index}>{paragraph}</p>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
