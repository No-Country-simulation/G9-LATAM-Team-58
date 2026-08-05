import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';

export function NotFoundPage() {
	return (
		<div className="flex w-full flex-col gap-6 pt-8 pb-20">
			<PageHeader title="Página no encontrada" description="La ruta que buscas no existe." />
			<div>
				<Link
					className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
					to="/"
				>
					Volver al inicio
				</Link>
			</div>
		</div>
	);
}
