import { SectionHeading, SegmentedBar } from '@/components/data-display';
import { Card, CardContent } from '@/components/ui/card';
import { useElapsedSeconds } from '@/shared/hooks/use-elapsed-seconds';
import { useSimulatedProgress } from '@/shared/hooks/use-simulated-progress';
import { INFERENCE_PIPELINE } from '../pipeline';
import { InferencePipeline } from './inference-pipeline';

export function ProcessingPanel() {
	const progress = useSimulatedProgress();
	const elapsed = useElapsedSeconds();

	return (
		<Card className="flex-1">
			<CardContent className="flex flex-1 flex-col">
				<SectionHeading>Pipeline de inferencia</SectionHeading>
				<InferencePipeline steps={INFERENCE_PIPELINE} />

				<div className="mt-auto flex flex-col gap-2 border-t pt-6">
					<div className="flex items-center gap-4">
						<SegmentedBar value={progress / 100} className="flex-1" />
						<span className="font-mono text-xl tabular-nums text-foreground">{progress}%</span>
					</div>
					<p className="font-mono text-[11px] tabular-nums text-text-dim">
						tiempo transcurrido {elapsed.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} s
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
