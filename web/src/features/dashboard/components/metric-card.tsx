import type { Icon } from '@tabler/icons-react';
import type { CSSProperties } from 'react';

interface MetricCardProps {
	label: string;
	value: string | number;
	detail: string;
	icon: Icon;
	/** CSS variable name for the accent colour, e.g. '--cat-backend' or '--success'. */
	accent: string;
}

export function MetricCard({ label, value, detail, icon: IconComponent, accent }: MetricCardProps) {
	const style = { '--accent': `var(${accent})` } as CSSProperties;

	return (
		<section style={style} className="relative overflow-hidden rounded-md border bg-card p-5">
			<div className="absolute inset-x-0 top-0 h-0.5 bg-(--accent)" />
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
					<p className="mt-5 font-mono text-4xl font-medium leading-none tabular-nums">{value}</p>
				</div>
				<div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-(--accent)">
					<IconComponent className="size-6" strokeWidth={1.8} />
				</div>
			</div>
			<p className="mt-5 border-t pt-3 text-sm text-muted-foreground">{detail}</p>
		</section>
	);
}
