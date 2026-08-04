import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-(--ui-color)/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			color: {
				primary:
					'[--ui-color:var(--primary)] [--ui-foreground:var(--primary-foreground)] [--ui-hover:color-mix(in_oklch,var(--primary),transparent_20%)]',
				secondary:
					'[--ui-color:var(--secondary)] [--ui-foreground:var(--secondary-foreground)] [--ui-hover:color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]',
				destructive:
					'[--ui-color:var(--destructive)] [--ui-foreground:var(--background)] [--ui-hover:color-mix(in_oklch,var(--destructive),transparent_20%)]',
				neutral:
					'[--ui-color:var(--foreground)] [--ui-foreground:var(--background)] [--ui-hover:color-mix(in_oklch,var(--foreground),transparent_20%)]'
			},
			variant: {
				filled: 'bg-(--ui-color) text-(--ui-foreground) hover:bg-(--ui-hover)',
				soft: 'bg-(--ui-color)/10 text-(--ui-color) hover:bg-(--ui-color)/20 aria-expanded:bg-(--ui-color)/20 dark:bg-(--ui-color)/20 dark:hover:bg-(--ui-color)/30',
				outline:
					'border-(--ui-color)/25 text-(--ui-color) hover:bg-(--ui-color)/10 aria-expanded:bg-(--ui-color)/10 dark:border-(--ui-color)/30',
				ghost:
					'text-(--ui-color) hover:bg-(--ui-color)/10 aria-expanded:bg-(--ui-color)/10 dark:hover:bg-(--ui-color)/15',
				link: 'text-(--ui-color) underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				icon: 'size-8',
				'icon-xs':
					"size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
				'icon-lg': 'size-9'
			}
		},
		defaultVariants: {
			color: 'primary',
			variant: 'filled',
			size: 'default'
		}
	}
);

function Button({
	className,
	color = 'primary',
	variant = 'filled',
	size = 'default',
	asChild = false,
	...props
}: Omit<React.ComponentProps<'button'>, 'color'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : 'button';

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-color={color}
			data-size={size}
			className={cn(buttonVariants({ color, variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
