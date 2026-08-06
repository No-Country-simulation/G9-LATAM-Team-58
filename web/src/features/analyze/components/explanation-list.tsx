// The API returns `explanation` as plain terms, not weighted
// features. The design mocks show a probability distribution here; until the
// contract exposes one, this renders the terms with the same row rhythm — no
// invented bars or weights.
export function ExplanationList({ explanation }: { explanation: string[] }) {
	if (explanation.length === 0) {
		return null;
	}

	return (
		<ul className="flex flex-col gap-2.5">
			{explanation.map(term => (
				<li key={term} className="flex items-center gap-3">
					<span className="size-1.5 shrink-0 rounded-full bg-primary" />
					<span className="text-[13px] text-foreground">{term}</span>
				</li>
			))}
		</ul>
	);
}
