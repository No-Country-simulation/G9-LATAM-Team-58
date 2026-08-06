import { IconFileUpload, IconMap2, IconSearch, IconSparkles, type Icon } from '@tabler/icons-react';

export interface QuickAction {
	to: string;
	label: string;
	icon: Icon;
	variant: 'primary' | 'secondary';
}

// Promotional copy for the home screen, distinct from the sidebar's NAV_GROUPS labels.
export const QUICK_ACTIONS: QuickAction[] = [
	{ to: '/analizar', label: 'Analizar contenido', icon: IconSparkles, variant: 'primary' },
	{ to: '/buscar', label: 'Buscar en la base', icon: IconSearch, variant: 'secondary' },
	{ to: '/lote', label: 'Cargar archivo CSV', icon: IconFileUpload, variant: 'secondary' },
	{ to: '/mapa', label: 'Explorar el mapa', icon: IconMap2, variant: 'secondary' }
];
