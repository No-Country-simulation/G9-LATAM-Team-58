// The contract returns plain terms (`keywords: string[]`), with no weights, so
// the chips carry no score
export function KeywordChips({ keywords }: { keywords: string[] }) {
	return (
		<div className="flex flex-wrap gap-2">
			{keywords.map(keyword => (
				<span
					key={keyword}
					className="rounded-full border border-outline bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground"
				>
					{keyword}
				</span>
			))}
		</div>
	);
}
