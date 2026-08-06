import type { SVGProps } from 'react';

/** The compact SVG mark used to identify Mindloom in the application shell. */
export function BrandMark({ className, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 36 36" fill="none" role="img" aria-label="Mindloom" className={className} {...props}>
			<line x1="3" y1="4" x2="3" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity={0.35} />
			{[
				{ y: 7, w: 18 },
				{ y: 18, w: 24 },
				{ y: 29, w: 12 }
			].map(row => (
				<g key={row.y}>
					<line
						x1="9"
						y1={row.y}
						x2={9 + row.w}
						y2={row.y}
						stroke="currentColor"
						strokeWidth="4"
						strokeLinecap="round"
					/>
					<circle cx={9 + row.w + 5} cy={row.y} r="2.5" fill="currentColor" />
				</g>
			))}
		</svg>
	);
}
