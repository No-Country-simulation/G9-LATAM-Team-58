import {
	IconArrowRight,
	IconChartBar,
	IconDatabase,
	IconFileUpload,
	IconMap2,
	IconSearch,
	IconSparkles
} from '@tabler/icons-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { useModelInfo, useStats } from '@/features/dashboard';
import { cn } from '@/shared/lib/utils';

const categoryOrder = [
	'Backend',
	'Frontend',
	'Móvil',
	'Datos e IA',
	'DevOps y Cloud',
	'Bases de datos',
	'Seguridad',
	'Fundamentos'
];

const categoryColor: Record<string, string> = {
	Backend: 'bg-cat-backend',
	Frontend: 'bg-cat-frontend',
	'Móvil': 'bg-cat-movil',
	'Datos e IA': 'bg-cat-datos-ia',
	'DevOps y Cloud': 'bg-cat-devops-cloud',
	'Bases de datos': 'bg-cat-bases-de-datos',
	Seguridad: 'bg-cat-seguridad',
	Fundamentos: 'bg-cat-fundamentos'
};

function MetricCard({
	label,
	value,
	detail,
	icon: Icon,
	accentClass
}: {
	label: string;
	value: string | number;
	detail: string;
	icon: typeof IconDatabase;
	accentClass: string;
}) {
	return (
		<section className="relative overflow-hidden rounded-md border bg-card p-5">
			<div className={cn('absolute inset-x-0 top-0 h-0.5', accentClass)} />
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
					<p className="mt-5 font-mono text-4xl font-medium leading-none tabular-nums">{value}</p>
				</div>
				<div className={cn('flex size-11 shrink-0 items-center justify-center rounded-md bg-muted', accentClass.replace('bg-', 'text-'))}>
					<Icon className="size-6" strokeWidth={1.8} />
				</div>
			</div>
			<p className="mt-5 border-t pt-3 text-sm text-muted-foreground">{detail}</p>
		</section>
	);
}

export function HomePage() {
	const stats = useStats();
	const model = useModelInfo();
	const byCategory = stats.data?.byCategory ?? {};
	const total = stats.data?.total ?? 0;
	const activeCategories = Object.values(byCategory).filter(value => value > 0).length;

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-8 pb-20">
			<PageHeader
				title="Inicio"
				description="Vista general de la base de conocimiento y el estado de clasificación."
			/>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<MetricCard label="Contenidos indexados" value={stats.isSuccess ? total : '—'} detail="registros disponibles" icon={IconDatabase} accentClass="bg-cat-backend" />
				<MetricCard label="Añadidos esta semana" value={stats.isSuccess ? stats.data.addedThisWeek : '—'} detail="nuevos documentos" icon={IconChartBar} accentClass="bg-success" />
				<MetricCard label="Categorías activas" value={stats.isSuccess ? activeCategories : '—'} detail="de 8 categorías posibles" icon={IconSparkles} accentClass="bg-cat-datos-ia" />
			</section>

			<section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)]">
				<div className="rounded-md border bg-card p-5">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Distribución del conocimiento</p>
							<h2 className="mt-1 font-heading text-lg font-semibold">Contenidos por categoría</h2>
						</div>
						<Link to="/contenidos" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
							Biblioteca <IconArrowRight className="size-4" />
						</Link>
					</div>

					<div className="mt-6 space-y-3">
						{stats.isLoading
							? Array.from({ length: 5 }, (_, index) => <div key={index} className="h-8 animate-pulse rounded bg-muted" />)
							: categoryOrder.map(category => {
								const count = byCategory[category] ?? 0;
								const percentage = total ? Math.round((count / total) * 100) : 0;
								return (
									<div key={category} className="grid grid-cols-[145px_minmax(0,1fr)_42px] items-center gap-3 text-sm">
										<span className="flex items-center gap-2 text-muted-foreground"><span className={cn('size-1.5 rounded-full', categoryColor[category])} />{category}</span>
										<div className="h-1.5 overflow-hidden rounded-sm bg-muted"><div className={cn('h-full rounded-sm', categoryColor[category])} style={{ width: `${percentage}%` }} /></div>
										<span className="text-right font-mono text-xs tabular-nums text-muted-foreground">{count}</span>
									</div>
								);
							})}
					</div>
				</div>

				<div className="rounded-md border bg-card p-5">
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Acciones rápidas</p>
					<div className="mt-4 grid gap-2">
						<Link to="/analizar" className="flex items-center justify-between rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"><span className="flex items-center gap-2"><IconSparkles className="size-4" />Analizar contenido</span><IconArrowRight className="size-4" /></Link>
						<Link to="/buscar" className="flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors hover:bg-accent"><span className="flex items-center gap-2"><IconSearch className="size-4 text-muted-foreground" />Buscar en la base</span><IconArrowRight className="size-4 text-muted-foreground" /></Link>
						<Link to="/lote" className="flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors hover:bg-accent"><span className="flex items-center gap-2"><IconFileUpload className="size-4 text-muted-foreground" />Cargar archivo CSV</span><IconArrowRight className="size-4 text-muted-foreground" /></Link>
						<Link to="/mapa" className="flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors hover:bg-accent"><span className="flex items-center gap-2"><IconMap2 className="size-4 text-muted-foreground" />Explorar el mapa</span><IconArrowRight className="size-4 text-muted-foreground" /></Link>
					</div>
				</div>
			</section>

			<section className="flex flex-wrap items-center justify-between gap-4 rounded-md border bg-card px-5 py-4">
				<div>
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Estado del modelo</p>
					<p className="mt-1 text-sm text-muted-foreground">Clasificación semántica y recuperación vectorial disponibles.</p>
				</div>
				<div className="flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground">
					<span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-success shadow-[0_0_6px_var(--success)]" />operativo</span>
					<span>{model.data?.version ?? 'modelo v1'}</span>
					<span>{model.data ? `${model.data.dim}d` : '384d'}</span>
					<span>{model.data ? `F1 ${model.data.macroF1.toFixed(2)}` : 'F1 0.84'}</span>
				</div>
			</section>
		</div>
	);
}
