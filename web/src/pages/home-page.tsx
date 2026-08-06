import { PageHeader } from '@/components/layout/page-header';
import {
	CategoryDistribution,
	DashboardMetrics,
	ModelStatus,
	QuickActionsPanel,
	useModelInfo,
	useStats
} from '@/features/dashboard';

export function HomePage() {
	const stats = useStats();
	const model = useModelInfo();

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-8 pb-20">
			<PageHeader title="Inicio" description="Vista general de la base de conocimiento y el estado de clasificación." />

			<DashboardMetrics stats={stats.data} isSuccess={stats.isSuccess} />

			<section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)]">
				<CategoryDistribution byCategory={stats.data?.byCategory ?? {}} isLoading={stats.isLoading} />
				<QuickActionsPanel />
			</section>

			<ModelStatus model={model.data} />
		</div>
	);
}
