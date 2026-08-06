import { IconSearch } from '@tabler/icons-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

interface MapSearchProps {
	value: string;
	onChange: (value: string) => void;
}

/** Filters the points already loaded on screen — the whole corpus is in memory, so this is a client-side dim, not a server search. */
export function MapSearch({ value, onChange }: MapSearchProps) {
	return (
		<div className="absolute top-6 right-6 z-20 w-[260px]">
			<InputGroup className="border-outline bg-card/80 backdrop-blur-md">
				<InputGroupInput
					value={value}
					onChange={event => onChange(event.target.value)}
					placeholder="Buscar en el mapa"
					aria-label="Buscar en el mapa"
				/>
				<InputGroupAddon>
					<IconSearch />
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
}
