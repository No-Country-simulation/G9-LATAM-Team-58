import { useModelInfo } from '@/features/dashboard';

/** The real numbers behind the vector: dimensionality and embedding model, nothing invented. */
export function ModelInfo() {
	const model = useModelInfo();

	if (!model.data) {
		return null;
	}

	return (
		<div className="flex flex-col gap-1 px-2">
			<h3 className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">Vector</h3>
			<p className="font-mono text-[11px] text-text-dim">
				{model.data.dim} dimensiones · {model.data.embeddingModel}
			</p>
		</div>
	);
}
