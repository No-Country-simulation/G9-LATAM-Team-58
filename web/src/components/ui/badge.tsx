import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
	'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-(--ui-color)/40 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
	{
		variants: {
			color: {
				primary:
					'[--ui-color:var(--primary)] [--ui-foreground:var(--primary-foreground)] [--ui-hover:color-mix(in_oklch,var(--primary),transparent_20%)]',
				secondary:
					'[--ui-color:var(--secondary)] [--ui-foreground:var(--secondary-foreground)] [--ui-hover:color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]',
				destructive:
					'[--ui-color:var(--destructive)] [--ui-foreground:var(--background)] [--ui-hover:color-mix(in_oklch,var(--destructive),transparent_20%)]',
				success:
					'[--ui-color:var(--success)] [--ui-foreground:var(--success-foreground)] [--ui-hover:color-mix(in_oklch,var(--success),transparent_20%)]',
				neutral:
					'[--ui-color:var(--foreground)] [--ui-foreground:var(--background)] [--ui-hover:color-mix(in_oklch,var(--foreground),transparent_20%)]'
			},
			variant: {
				filled: 'bg-(--ui-color) text-(--ui-foreground) [a&]:hover:bg-(--ui-hover)',
				soft: 'bg-(--ui-color)/10 text-(--ui-color) dark:bg-(--ui-color)/20 [a&]:hover:bg-(--ui-color)/20 dark:[a&]:hover:bg-(--ui-color)/30',
				outline: 'border-(--ui-color)/25 text-(--ui-color) dark:border-(--ui-color)/30 [a&]:hover:bg-(--ui-color)/10',
				ghost: 'text-(--ui-color) hover:bg-(--ui-color)/10 dark:hover:bg-(--ui-color)/15',
				link: 'text-(--ui-color) underline-offset-4 hover:underline'
			}
		},
		defaultVariants: {
			color: 'primary',
			variant: 'filled'
		}
	}
);

function Badge({
	className,
	color = 'primary',
	variant = 'filled',
	asChild = false,
	...props
}: Omit<React.ComponentProps<'span'>, 'color'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : 'span';

	return (
		<Comp
			data-slot="badge"
			data-variant={variant}
			data-color={color}
			className={cn(badgeVariants({ color, variant, className }))}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
