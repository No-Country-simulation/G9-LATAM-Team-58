import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/shared/lib/utils';

const STEPS = ['Archivo', 'Procesando', 'Resumen'] as const;

interface BatchStepperProps {
	current: 1 | 2 | 3;
	hasError?: boolean;
}

export function BatchStepper({ current, hasError }: BatchStepperProps) {
	return (
		<ol className="flex items-center gap-3">
			{STEPS.map((label, index) => {
				const step = index + 1;
				const isDone = step < current && !hasError;
				const isCurrent = step === current;
				const isErrored = isCurrent && hasError;

				return (
					<li key={label} className="flex items-center gap-3">
						{index > 0 && <span className={cn('h-px w-10', isDone ? 'bg-primary' : 'bg-border')} />}
						<div className="flex items-center gap-2">
							<span
								className={cn(
									'flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]',
									isErrored && 'border-destructive text-destructive',
									!isErrored && isDone && 'border-primary bg-primary text-primary-foreground',
									!isErrored && isCurrent && 'border-primary text-primary',
									!isErrored && !isDone && !isCurrent && 'border-border text-muted-foreground'
								)}
							>
								{isDone ? <IconCheck className="size-3.5" /> : step}
							</span>
							<span
								className={cn(
									'font-mono text-[11px] uppercase tracking-[0.06em]',
									isErrored && 'text-destructive',
									!isErrored && (isDone || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
								)}
							>
								{label}
							</span>
						</div>
					</li>
				);
			})}
		</ol>
	);
}
