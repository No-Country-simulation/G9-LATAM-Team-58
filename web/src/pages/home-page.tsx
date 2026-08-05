import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { useStats } from '@/features/dashboard';

export function HomePage() {
	const stats = useStats();

	return (
		<div className="flex w-full flex-col gap-6 pt-8 pb-20">
			<PageHeader
				title="Base de conocimiento técnica"
				description="Clasifica contenido técnico en 8 categorías, extrae palabras clave y encuentra documentos relacionados semánticamente."
			/>

			{stats.isSuccess && (
				<div className="row">
					<div className="card">
						<strong>{stats.data.total}</strong>
						<div className="muted">contenidos</div>
					</div>
					<div className="card">
						<strong>{stats.data.addedThisWeek}</strong>
						<div className="muted">esta semana</div>
					</div>
					<div className="card">
						<strong>{Object.keys(stats.data.byCategory).length}</strong>
						<div className="muted">categorías activas</div>
					</div>
				</div>
			)}

			<div className="row">
				<Link className="btn btn--primary" to="/buscar">
					Buscar
				</Link>
				<Link className="btn" to="/mapa">
					Ver el mapa
				</Link>
			</div>
		</div>
	);
}
