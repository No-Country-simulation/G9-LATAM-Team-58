import { Link } from 'react-router';

export function NotFoundPage() {
	return (
		<div className="stack">
			<h1>Página no encontrada</h1>
			<p className="muted">La ruta que buscas no existe.</p>
			<div>
				<Link className="btn" to="/">
					Volver al inicio
				</Link>
			</div>
		</div>
	);
}
