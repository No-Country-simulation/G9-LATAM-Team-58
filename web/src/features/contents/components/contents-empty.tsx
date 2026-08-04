import { IconChartDots3, IconLibrary, IconUpload } from '@tabler/icons-react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/data-display';
import { Button } from '@/components/ui/button';

interface ContentsEmptyProps {
	hasFilters: boolean;
	onClearFilters: () => void;
}

export function ContentsEmpty({ hasFilters, onClearFilters }: ContentsEmptyProps) {
	if (hasFilters) {
		return (
			<EmptyState icon={IconLibrary} title="Sin coincidencias" description="Ningún contenido coincide con este filtro.">
				<Button type="button" variant="outline" onClick={onClearFilters}>
					Limpiar filtros
				</Button>
			</EmptyState>
		);
	}

	return (
		<EmptyState
			icon={IconLibrary}
			title="La biblioteca está vacía"
			description="Todavía no hay contenido clasificado. Analiza un texto suelto o carga un CSV para empezar."
		>
			<Button asChild data-icon="inline-start">
				<Link to="/analizar">
					<IconChartDots3 />
					Analizar contenido
				</Link>
			</Button>
			<Button asChild variant="outline" data-icon="inline-start">
				<Link to="/lote">
					<IconUpload />
					Cargar CSV
				</Link>
			</Button>
		</EmptyState>
	);
}
