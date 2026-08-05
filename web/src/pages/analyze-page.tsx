import { useState } from 'react';
import { AnalyzeForm, ResultPanel, useAnalyzeContent } from '@/features/analyze';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

export function AnalyzePage() {
	const analyze = useAnalyzeContent();
	// Bumping the key remounts the form so "Analizar otro" clears both the
	// mutation result and the fields.
	const [formKey, setFormKey] = useState(0);

	function reset() {
		analyze.reset();
		setFormKey(current => current + 1);
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-6">
			<PageHeader
				title="Analizar contenido"
				description="Pega un texto técnico y el modelo lo clasificará en una de las 8 categorías."
			/>

			<div className="flex min-h-0 flex-1 flex-col gap-6 md:h-[calc(100dvh-11rem)] md:flex-row">
				<Card className="flex min-h-0 flex-1 flex-col md:w-1/2">
					<CardContent className="flex min-h-0 flex-1 flex-col">
						<AnalyzeForm
							key={formKey}
							isPending={analyze.isPending}
							hasResult={analyze.isSuccess}
							onSubmit={input => analyze.mutate(input)}
							onReset={reset}
						/>
					</CardContent>
				</Card>

				<section className="flex min-h-0 flex-1 flex-col md:w-1/2">
					<ResultPanel
						isPending={analyze.isPending}
						error={analyze.error}
						data={analyze.data ?? null}
						// A real retry: re-send the same payload. React Query keeps it
						// in `variables`, so the form state does not need lifting.
						onRetry={() => {
							if (analyze.variables) {
								analyze.mutate(analyze.variables);
							}
						}}
					/>
				</section>
			</div>
		</div>
	);
}
