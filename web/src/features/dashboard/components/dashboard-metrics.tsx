import { IconChartBar, IconDatabase, IconSparkles } from '@tabler/icons-react';
import type { StatsResponse } from '@/shared/api/contracts';
import { MetricCard } from './metric-card';

interface DashboardMetricsProps {
	stats: StatsResponse | undefined;
	isSuccess: boolean;
}

export function DashboardMetrics({ stats, isSuccess }: DashboardMetricsProps) {
	const byCategory = stats?.byCategory ?? {};
	const total = stats?.total ?? 0;
	const activeCategories = Object.values(byCategory).filter(value => value > 0).length;

	return (
		<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			<MetricCard
				label="Contenidos indexados"
				value={isSuccess ? total : '—'}
				detail="registros disponibles"
				icon={IconDatabase}
				accent="--cat-backend"
			/>
			<MetricCard
				label="Añadidos esta semana"
				value={isSuccess && stats ? stats.addedThisWeek : '—'}
				detail="nuevos documentos"
				icon={IconChartBar}
				accent="--success"
			/>
			<MetricCard
				label="Categorías activas"
				value={isSuccess ? activeCategories : '—'}
				detail="de 8 categorías posibles"
				icon={IconSparkles}
				accent="--cat-datos-ia"
			/>
		</section>
	);
}
