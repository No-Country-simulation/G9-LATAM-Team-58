import { BrandMark } from '@/components/brand/brand-mark';

interface BrandLockupProps {
	className?: string;
	markClassName?: string;
	showTagline?: boolean;
}

/** Brand mark paired with the product name and optional tagline. */
export function BrandLockup({ className, markClassName = 'h-9 w-9', showTagline = true }: BrandLockupProps) {
	return (
		<span className={`inline-flex items-center gap-3 ${className ?? ''}`}>
			<BrandMark className={markClassName} />
			<span className="flex flex-col leading-none">
				<span className="font-heading text-base font-semibold tracking-[0.22em] text-foreground uppercase">
					Mindloom
				</span>
				{showTagline && (
					<span className="mt-1 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
						Organización inteligente
					</span>
				)}
			</span>
		</span>
	);
}
