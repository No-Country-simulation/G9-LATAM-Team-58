import { IconCircle, IconCircleCheck } from '@tabler/icons-react';
import { cn } from '@/shared/lib/utils';
import type { PipelineStep } from '../pipeline';

function StepIndicator({ state }: { state: PipelineStep['state'] }) {
	if (state === 'done') {
		return <IconCircleCheck className="size-4 shrink-0 text-success" />;
	}
	if (state === 'active') {
		return <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />;
	}
	return <IconCircle className="size-4 shrink-0 text-outline" />;
}

/** Renders the pipeline steps. Owns no timing logic: the steps arrive as data. */
export function InferencePipeline({ steps }: { steps: PipelineStep[] }) {
	return (
		<ul className="flex flex-col gap-4">
			{steps.map(step => (
				<li key={step.id} className="flex items-center gap-3">
					<StepIndicator state={step.state} />
					<span
						className={cn(
							'text-sm',
							step.state === 'pending' && 'text-text-dim',
							step.state === 'active' && 'font-medium text-foreground',
							step.state === 'done' && 'text-foreground'
						)}
					>
						{step.label}
					</span>
					<span className="ml-auto font-mono text-[11px] tabular-nums text-text-dim">
						{step.state === 'active' ? '· · ·' : step.elapsed}
					</span>
				</li>
			))}
		</ul>
	);
}
