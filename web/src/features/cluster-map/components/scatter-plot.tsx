import { scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Zoom } from '@visx/zoom';
import type { ProvidedZoom, ZoomState } from '@visx/zoom';
import { useEffect, useMemo, useRef } from 'react';
import { categoryColorVar } from '@/shared/config/categories';
import { useTheme } from '@/shared/theme/use-theme';
import type { MapPoint } from '@/shared/api/contracts';
import { MapControls } from './map-controls';
import { MapStatusBar } from './map-status-bar';
import { MapTooltip } from './map-tooltip';

const PADDING = 40;
const POINT_RADIUS = 1.2;
const SELECTED_POINT_RADIUS = 3.5;
const DIMMED_ALPHA = 0.12;
const NORMAL_ALPHA = 0.6;
const HIT_RADIUS_PX = 6;
const DRAG_THRESHOLD_PX = 4;
const TWO_PI = Math.PI * 2;
const SCALE_MIN = 0.5;
const SCALE_MAX = 8;
const ZOOM_STEP = 1.3;

const GRID_BACKGROUND = {
	backgroundImage: 'radial-gradient(circle, var(--outline) 1px, transparent 1px)',
	backgroundSize: '24px 24px'
};

interface PositionedPoint {
	point: MapPoint;
	x: number;
	y: number;
}

function isPointDimmed(point: MapPoint, activeCategory: string | undefined, lowerQuery: string): boolean {
	if (activeCategory && point.category !== activeCategory) {
		return true;
	}
	if (lowerQuery && !point.title.toLowerCase().includes(lowerQuery)) {
		return true;
	}
	return false;
}

interface ScatterPlotProps {
	points: MapPoint[];
	width: number;
	height: number;
	activeCategory: string | undefined;
	query: string;
	selectedId: string | undefined;
	onSelect: (point: MapPoint) => void;
}

/**
 * The scatter itself. Canvas, not SVG: the corpus is ~16k points, and a
 * `transform` on an SVG `<g>` repaints the whole subtree every frame instead of
 * compositing on the GPU the way a CSS transform would. One `<canvas>` node
 * scales to this size where thousands of DOM nodes did not.
 */
export function ScatterPlot({ points, width, height, activeCategory, query, selectedId, onSelect }: ScatterPlotProps) {
	const { resolvedTheme } = useTheme();

	const { xScale, yScale } = useMemo(() => {
		let xMin = Infinity;
		let xMax = -Infinity;
		let yMin = Infinity;
		let yMax = -Infinity;
		for (const point of points) {
			if (point.x < xMin) xMin = point.x;
			if (point.x > xMax) xMax = point.x;
			if (point.y < yMin) yMin = point.y;
			if (point.y > yMax) yMax = point.y;
		}
		return {
			xScale: scaleLinear<number>({ domain: [xMin, xMax], range: [PADDING, width - PADDING] }),
			yScale: scaleLinear<number>({ domain: [yMin, yMax], range: [PADDING, height - PADDING] })
		};
	}, [points, width, height]);

	// Grouped once per data/layout change — the draw loop below iterates these
	// groups instead of re-grouping every frame.
	const positionsByColorVar = useMemo(() => {
		const groups = new Map<string, PositionedPoint[]>();
		for (const point of points) {
			const colorVar = categoryColorVar(point.category);
			const entry: PositionedPoint = { point, x: xScale(point.x), y: yScale(point.y) };
			const group = groups.get(colorVar);
			if (group) {
				group.push(entry);
			} else {
				groups.set(colorVar, [entry]);
			}
		}
		return groups;
	}, [points, xScale, yScale]);

	// Canvas needs resolved colours, not `var(...)` — read once per theme change.
	const colors = useMemo(() => {
		if (typeof window === 'undefined') {
			return new Map<string, string>();
		}
		const styles = getComputedStyle(document.documentElement);
		const resolved = new Map<string, string>();
		for (const colorVar of positionsByColorVar.keys()) {
			resolved.set(colorVar, styles.getPropertyValue(colorVar).trim());
		}
		resolved.set('--foreground', styles.getPropertyValue('--foreground').trim());
		return resolved;
		// `resolvedTheme` isn't read directly — it's the dependency that forces this
		// memo to re-run and re-read the vars from the DOM after `.dark` flips.
	}, [positionsByColorVar, resolvedTheme]);

	const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip<MapPoint>();
	const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal({ scroll: true, detectBounds: true });

	function handleHover(point: MapPoint | undefined, clientX: number, clientY: number) {
		if (!point) {
			hideTooltip();
			return;
		}
		showTooltip({
			tooltipData: point,
			tooltipLeft: clientX - containerBounds.left,
			tooltipTop: clientY - containerBounds.top
		});
	}

	if (width === 0 || height === 0) {
		return null;
	}

	return (
		<Zoom<HTMLCanvasElement>
			width={width}
			height={height}
			scaleXMin={SCALE_MIN}
			scaleXMax={SCALE_MAX}
			scaleYMin={SCALE_MIN}
			scaleYMax={SCALE_MAX}
		>
			{zoom => (
				<div ref={containerRef} className="relative h-full w-full" style={GRID_BACKGROUND}>
					<ScatterCanvas
						zoom={zoom}
						width={width}
						height={height}
						positionsByColorVar={positionsByColorVar}
						colors={colors}
						activeCategory={activeCategory}
						query={query}
						selectedId={selectedId}
						onSelect={onSelect}
						onHover={handleHover}
					/>

					<MapControls
						onZoomIn={() => zoom.scale({ scaleX: ZOOM_STEP, scaleY: ZOOM_STEP })}
						onZoomOut={() => zoom.scale({ scaleX: 1 / ZOOM_STEP, scaleY: 1 / ZOOM_STEP })}
						onReset={() => zoom.reset()}
					/>
					<MapStatusBar count={points.length} zoomLevel={zoom.transformMatrix.scaleX} />

					{tooltipOpen && tooltipData && (
						<TooltipInPortal left={tooltipLeft} top={tooltipTop} unstyled applyPositionStyle>
							<div className="pointer-events-none rounded-md border border-outline bg-card p-3 shadow-lg">
								<MapTooltip point={tooltipData} />
							</div>
						</TooltipInPortal>
					)}
				</div>
			)}
		</Zoom>
	);
}

interface ScatterCanvasProps {
	zoom: ProvidedZoom<HTMLCanvasElement> & ZoomState;
	width: number;
	height: number;
	positionsByColorVar: Map<string, PositionedPoint[]>;
	colors: Map<string, string>;
	activeCategory: string | undefined;
	query: string;
	selectedId: string | undefined;
	onSelect: (point: MapPoint) => void;
	onHover: (point: MapPoint | undefined, clientX: number, clientY: number) => void;
}

/**
 * Owns the canvas element and everything that must react to the zoom
 * transform on every frame. Split out from `ScatterPlot` because it renders
 * inside the `<Zoom>` render prop: hooks called directly in that closure would
 * run under Zoom's own render, not this component's — a real footgun, not a
 * style preference. As its own component it gets a proper hook context.
 */
function ScatterCanvas({
	zoom,
	width,
	height,
	positionsByColorVar,
	colors,
	activeCategory,
	query,
	selectedId,
	onSelect,
	onHover
}: ScatterCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const drawFrameRef = useRef<number | null>(null);
	const hoverFrameRef = useRef<number | null>(null);
	const pendingHoverRef = useRef<{ x: number; y: number } | null>(null);
	const dragStartRef = useRef<{ x: number; y: number } | null>(null);
	const didDragRef = useRef(false);

	const { scaleX, scaleY, translateX, translateY, skewX, skewY } = zoom.transformMatrix;

	// React registers `wheel` as a passive listener at the root by default, so
	// `event.preventDefault()` inside a React `onWheel` handler is a silent
	// no-op — the canvas zooms AND the browser still scrolls/zooms the page
	// underneath it. A native, non-passive listener is the only way to actually
	// stop the browser's own gesture. `zoomRef` keeps the handler current
	// without re-subscribing on every zoom change (which fires constantly).
	// Refs can't be written during render, so this happens in an effect.
	const zoomRef = useRef(zoom);
	useEffect(() => {
		zoomRef.current = zoom;
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		function handleNativeWheel(event: WheelEvent) {
			event.preventDefault();
			zoomRef.current.handleWheel(event);
		}
		canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
		return () => canvas.removeEventListener('wheel', handleNativeWheel);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || width === 0 || height === 0) {
			return;
		}

		if (drawFrameRef.current !== null) {
			cancelAnimationFrame(drawFrameRef.current);
		}
		drawFrameRef.current = requestAnimationFrame(() => {
			drawFrameRef.current = null;
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				return;
			}

			const dpr = window.devicePixelRatio || 1;
			canvas.width = width * dpr;
			canvas.height = height * dpr;

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, width, height);
			ctx.transform(scaleX, skewY, skewX, scaleY, translateX, translateY);

			const screenRadius = POINT_RADIUS / scaleX;
			const selectedRadius = SELECTED_POINT_RADIUS / scaleX;
			const lowerQuery = query.trim().toLowerCase();
			let selected: PositionedPoint | undefined;

			for (const [colorVar, entries] of positionsByColorVar) {
				const color = colors.get(colorVar);
				if (!color) {
					continue;
				}
				ctx.fillStyle = color;

				ctx.globalAlpha = DIMMED_ALPHA;
				ctx.beginPath();
				let hasDimmed = false;
				for (const entry of entries) {
					if (entry.point.id === selectedId) {
						selected = entry;
						continue;
					}
					if (!isPointDimmed(entry.point, activeCategory, lowerQuery)) {
						continue;
					}
					hasDimmed = true;
					ctx.moveTo(entry.x + screenRadius, entry.y);
					ctx.arc(entry.x, entry.y, screenRadius, 0, TWO_PI);
				}
				if (hasDimmed) {
					ctx.fill();
				}

				ctx.globalAlpha = NORMAL_ALPHA;
				ctx.beginPath();
				let hasNormal = false;
				for (const entry of entries) {
					if (entry.point.id === selectedId || isPointDimmed(entry.point, activeCategory, lowerQuery)) {
						continue;
					}
					hasNormal = true;
					ctx.moveTo(entry.x + screenRadius, entry.y);
					ctx.arc(entry.x, entry.y, screenRadius, 0, TWO_PI);
				}
				if (hasNormal) {
					ctx.fill();
				}
			}

			if (selected) {
				const color = colors.get(categoryColorVar(selected.point.category));
				ctx.globalAlpha = 1;
				ctx.fillStyle = color ?? colors.get('--foreground') ?? '#fff';
				ctx.beginPath();
				ctx.arc(selected.x, selected.y, selectedRadius, 0, TWO_PI);
				ctx.fill();
				ctx.lineWidth = 1.5 / scaleX;
				ctx.strokeStyle = colors.get('--foreground') ?? '#fff';
				ctx.stroke();
			}
		});

		return () => {
			if (drawFrameRef.current !== null) {
				cancelAnimationFrame(drawFrameRef.current);
			}
		};
	}, [
		width,
		height,
		positionsByColorVar,
		colors,
		activeCategory,
		query,
		selectedId,
		scaleX,
		scaleY,
		translateX,
		translateY,
		skewX,
		skewY
	]);

	function findNearestPoint(clientX: number, clientY: number): MapPoint | undefined {
		const canvas = canvasRef.current;
		if (!canvas) {
			return undefined;
		}
		const rect = canvas.getBoundingClientRect();
		const worldPoint = zoom.applyInverseToPoint({ x: clientX - rect.left, y: clientY - rect.top });
		const hitRadiusWorld = HIT_RADIUS_PX / scaleX;
		const hitRadiusSq = hitRadiusWorld * hitRadiusWorld;

		let closest: PositionedPoint | undefined;
		let closestDistSq = Infinity;
		for (const entries of positionsByColorVar.values()) {
			for (const entry of entries) {
				const dx = entry.x - worldPoint.x;
				const dy = entry.y - worldPoint.y;
				const distSq = dx * dx + dy * dy;
				if (distSq <= hitRadiusSq && distSq < closestDistSq) {
					closest = entry;
					closestDistSq = distSq;
				}
			}
		}
		return closest?.point;
	}

	function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
		dragStartRef.current = { x: event.clientX, y: event.clientY };
		didDragRef.current = false;
		zoom.dragStart(event);
	}

	function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
		zoom.dragMove(event);

		if (dragStartRef.current) {
			const dx = event.clientX - dragStartRef.current.x;
			const dy = event.clientY - dragStartRef.current.y;
			if (dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
				didDragRef.current = true;
			}
		}

		pendingHoverRef.current = { x: event.clientX, y: event.clientY };
		if (hoverFrameRef.current !== null) {
			return;
		}
		hoverFrameRef.current = requestAnimationFrame(() => {
			hoverFrameRef.current = null;
			const pending = pendingHoverRef.current;
			if (!pending) {
				return;
			}
			const point = findNearestPoint(pending.x, pending.y);
			onHover(point, pending.x, pending.y);
		});
	}

	function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
		// The browser fires `click` whenever mousedown/mouseup land on the same
		// element, regardless of how far the pointer moved in between — without
		// this guard, dragging the map and releasing selects whatever point sat
		// under the original mousedown.
		if (didDragRef.current) {
			didDragRef.current = false;
			return;
		}
		const point = findNearestPoint(event.clientX, event.clientY);
		if (point) {
			onSelect(point);
		}
	}

	return (
		<canvas
			ref={canvasRef}
			style={{ width, height, touchAction: 'none' }}
			className={zoom.isDragging ? 'cursor-grabbing' : 'cursor-grab'}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={zoom.dragEnd}
			onMouseLeave={() => {
				onHover(undefined, 0, 0);
				if (zoom.isDragging) {
					zoom.dragEnd();
				}
			}}
			onClick={handleClick}
			onDoubleClick={() => zoom.reset()}
		/>
	);
}
