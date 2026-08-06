import type { CSSProperties } from 'react';

const cards = [
	{ x: 24, y: 20, width: 72, height: 14, delay: '0s' },
	{ x: 18, y: 40, width: 84, height: 14, delay: '0.25s' },
	{ x: 28, y: 60, width: 64, height: 14, delay: '0.5s' },
	{ x: 20, y: 80, width: 80, height: 14, delay: '0.75s' }
];

/** Animated visual for route loading: scattered content settling into an ordered stack. */
export function ContentStackMark() {
	return (
		<svg viewBox="0 0 120 120" className="h-32 w-32 overflow-visible" fill="none" aria-hidden="true">
			{cards.map((card, index) => (
				<g
					key={card.delay}
					className="animate-card-snap"
					style={{ animationDelay: card.delay, transformOrigin: `60px ${card.y + card.height / 2}px` } as CSSProperties}
				>
					<rect
						x={card.x}
						y={card.y}
						width={card.width}
						height={card.height}
						rx={4}
						className="stroke-loading-line"
						strokeWidth={1}
						fill="none"
					/>
					<line
						x1={card.x + 8}
						y1={card.y + card.height / 2}
						x2={card.x + 8 + card.width * 0.35}
						y2={card.y + card.height / 2}
						className="stroke-loading-line"
						strokeWidth={1.4}
						opacity={0.8}
					/>
					<circle
						cx={card.x + card.width - 8}
						cy={card.y + card.height / 2}
						r={2.2}
						className="fill-loading-accent animate-loading-flicker"
						style={{ animationDelay: `${index * 0.2}s` } as CSSProperties}
					/>
				</g>
			))}
			<line x1={10} y1={16} x2={10} y2={104} className="stroke-loading-line" strokeWidth={1} opacity={0.4} />
		</svg>
	);
}
