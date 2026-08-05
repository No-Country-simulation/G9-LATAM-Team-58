import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/utils';
import { QUICK_ACTIONS } from '../quick-actions';

export function QuickActionsPanel() {
	return (
		<div className="rounded-md border bg-card p-5">
			<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Acciones rápidas</p>
			<div className="mt-4 grid gap-2">
				{QUICK_ACTIONS.map(({ to, label, icon: IconComponent, variant }) => (
					<Link
						key={to}
						to={to}
						className={cn(
							'flex items-center justify-between rounded-md px-4 py-3 text-sm transition-colors',
							variant === 'primary'
								? 'bg-primary font-medium text-primary-foreground hover:opacity-90'
								: 'border hover:bg-accent'
						)}
					>
						<span className="flex items-center gap-2">
							<IconComponent className={cn('size-4', variant === 'secondary' && 'text-muted-foreground')} />
							{label}
						</span>
						<IconArrowRight className={cn('size-4', variant === 'secondary' && 'text-muted-foreground')} />
					</Link>
				))}
			</div>
		</div>
	);
}
