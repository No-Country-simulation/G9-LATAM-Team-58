import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router';
import { CategoryBadge } from '@/components/data-display';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import type { ContentDetail } from '@/shared/api/contracts';
import { formatDateTime } from '@/shared/lib/format';

export function DetailHeader({ detail }: { detail: ContentDetail }) {
	return (
		<header className="flex flex-col gap-4">
			<Breadcrumb>
				<BreadcrumbList className="font-mono text-[11px] text-text-dim">
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link to="/contenidos">Biblioteca</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>id {detail.id}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-3">
					<h1>{detail.title}</h1>
					<div className="flex items-center gap-3">
						<CategoryBadge category={detail.category} />
						<div className="flex items-center gap-3 font-mono text-[11px] text-text-dim">
							<span>{detail.source}</span>
							<span>·</span>
							<span>{formatDateTime(detail.addedAt)}</span>
							<span>·</span>
							<span>{detail.body.length.toLocaleString('es')} caracteres</span>
						</div>
					</div>
				</div>

				{detail.url && (
					<Button asChild variant="outline" data-icon="inline-start" className="shrink-0">
						<a href={detail.url} target="_blank" rel="noreferrer">
							<IconExternalLink />
							Ver original
						</a>
					</Button>
				)}
			</div>
		</header>
	);
}
