import { useEffect } from 'react';
import { Link, useRouteError } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

/**
 * Application fallback for the root route: any rendering or lazy-loading
 * failure in a child route lands here instead of React Router's bare default
 * error UI. "Reintentar" forces a full reload because the most common root
 * failure is a stale lazy chunk after a deploy, which only a reload recovers
 * from — the shell itself never rendered, so in-app navigation may not work.
 */
export function RouteErrorBoundary() {
	const error = useRouteError();

	useEffect(() => {
		console.error('Error al renderizar la ruta', error);
	}, [error]);

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8 text-center">
			<PageHeader title="Algo salió mal" description="Ocurrió un error inesperado al cargar esta vista." />
			<div className="flex gap-3">
				<Button onClick={() => window.location.reload()}>Reintentar</Button>
				<Button asChild variant="outline">
					<Link to="/">Volver al inicio</Link>
				</Button>
			</div>
		</div>
	);
}
