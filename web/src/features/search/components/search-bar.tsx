import { IconSearch, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';

interface SearchBarProps {
	value: string;
	isSearching: boolean;
	onChange: (value: string) => void;
	onSubmit: () => void;
	onClear: () => void;
}

export function SearchBar({ value, isSearching, onChange, onSubmit, onClear }: SearchBarProps) {
	return (
		<form
			className="flex gap-3"
			role="search"
			onSubmit={event => {
				event.preventDefault();
				onSubmit();
			}}
		>
			<InputGroup className="flex-1">
				<InputGroupInput
					value={value}
					onChange={event => onChange(event.target.value)}
					placeholder="¿Qué quieres encontrar?"
					aria-label="Término de búsqueda"
				/>
				<InputGroupAddon>
					<IconSearch />
				</InputGroupAddon>
				{value && (
					<InputGroupAddon align="inline-end">
						<InputGroupButton type="button" size="icon-xs" aria-label="Limpiar búsqueda" onClick={onClear}>
							<IconX />
						</InputGroupButton>
					</InputGroupAddon>
				)}
			</InputGroup>
			<Button type="submit" disabled={isSearching}>
				Buscar
			</Button>
		</form>
	);
}
