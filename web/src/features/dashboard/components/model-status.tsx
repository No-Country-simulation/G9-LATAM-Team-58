import type { ModelResponse } from '@/shared/api/contracts';

interface ModelStatusProps {
	model: ModelResponse | undefined;
}

export function ModelStatus({ model }: ModelStatusProps) {
	// Without a response from GET /model we do not know the version, the
	// dimension or the macro-F1 -- and we do not know the model is up either.
	// Showing placeholder numbers here put invented metrics on screen, so the
	// unloaded state now says exactly that instead.
	if (!model) {
		return (
			<section className="flex flex-wrap items-center justify-between gap-4 rounded-md border bg-card px-5 py-4">
				<div>
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Estado del modelo</p>
					<p className="mt-1 text-sm text-muted-foreground">Consultando el estado del modelo…</p>
				</div>
				<div className="flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground">
					<span className="flex items-center gap-2">
						<span className="size-1.5 rounded-full bg-muted-foreground/40" />
						sin datos
					</span>
				</div>
			</section>
		);
	}

	return (
		<section className="flex flex-wrap items-center justify-between gap-4 rounded-md border bg-card px-5 py-4">
			<div>
				<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Estado del modelo</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Clasificación semántica y recuperación vectorial disponibles.
				</p>
			</div>
			<div className="flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground">
				<span className="flex items-center gap-2">
					<span className="size-1.5 rounded-full bg-success shadow-[0_0_6px_var(--success)]" />
					operativo
				</span>
				<span>{model.version}</span>
				<span>{model.dim}d</span>
				<span>F1 {model.macroF1.toFixed(2)}</span>
			</div>
		</section>
	);
}
