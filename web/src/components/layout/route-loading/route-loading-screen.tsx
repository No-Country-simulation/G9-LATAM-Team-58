import { ContentStackMark } from './content-stack-mark';

interface RouteLoadingScreenProps {
	label?: string;
}

export function RouteLoadingScreen({ label = 'Mindloom' }: RouteLoadingScreenProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			aria-label={`Cargando ${label}`}
			className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background"
		>
			<div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow blur-[120px]" />
			<div className="relative flex flex-col items-center gap-8">
				<ContentStackMark />
				<div className="flex flex-col items-center gap-5">
					<p className="animate-text-in text-lg font-medium tracking-[0.35em] text-foreground/90 uppercase">{label}</p>
					<div className="relative h-px w-56 overflow-hidden rounded-full bg-track">
						<div className="animate-stream absolute inset-y-0 w-1/2 bg-stream" />
					</div>
				</div>
			</div>
		</div>
	);
}
