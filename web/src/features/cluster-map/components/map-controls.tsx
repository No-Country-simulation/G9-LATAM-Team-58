import { IconFocus2, IconMinus, IconPlus } from '@tabler/icons-react';

interface MapControlsProps {
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
}

const BUTTON_CLASS =
	'flex size-8 items-center justify-center rounded-md border border-outline bg-card/80 text-muted-foreground backdrop-blur-md transition-colors hover:bg-accent hover:text-foreground';

export function MapControls({ onZoomIn, onZoomOut, onReset }: MapControlsProps) {
	return (
		<div className="absolute right-6 bottom-6 z-20 flex flex-col gap-2">
			<button type="button" aria-label="Acercar" className={BUTTON_CLASS} onClick={onZoomIn}>
				<IconPlus className="size-[18px]" />
			</button>
			<button type="button" aria-label="Alejar" className={BUTTON_CLASS} onClick={onZoomOut}>
				<IconMinus className="size-[18px]" />
			</button>
			<button type="button" aria-label="Centrar" className={`${BUTTON_CLASS} mt-2`} onClick={onReset}>
				<IconFocus2 className="size-[18px]" />
			</button>
		</div>
	);
}
