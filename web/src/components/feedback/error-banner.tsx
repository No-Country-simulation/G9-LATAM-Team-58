import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import type { ApiError } from '@/shared/api/client';

interface ErrorBannerProps {
	title: string;
	error: ApiError;
	onRetry?: () => void;
}

export function ErrorBanner({ title, error, onRetry }: ErrorBannerProps) {
	return (
		<div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4">
			<IconAlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div>
					<h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
					<p className="mt-1 text-[13px] text-muted-foreground">{error.message}</p>
				</div>
				<div className="flex items-center justify-between gap-3">
					<span className="font-mono text-[11px] tracking-wide text-destructive">
						{error.code}
						{/* status 0 means the request never reached the API (network/timeout). */}
						{error.status > 0 && ` · ${error.status}`}
					</span>
					{onRetry && (
						<Button type="button" variant="outline" size="sm" data-icon="inline-start" onClick={onRetry}>
							<IconRefresh />
							Reintentar
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
