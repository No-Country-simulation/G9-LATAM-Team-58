import {
	IconAnalyze,
	IconFileTypeCsv,
	IconHome,
	IconMap2,
	IconSearch,
	IconSquarePlus,
	IconStack2,
	type Icon
} from '@tabler/icons-react';

export interface NavItem {
	to: string;
	label: string;
	icon: Icon;
	/** NavLink `end` prop: exact match for "/" style routes. */
	end?: boolean;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

/**
 * Single source of truth for the app menu.
 * Adding a page = one entry here + its route in `src/app/routes.ts`.
 */
export const NAV_GROUPS: NavGroup[] = [
	{
		label: 'General',
		items: [
			{ to: '/', label: 'Inicio', icon: IconHome, end: true },
			{ to: '/analizar', label: 'Analizar', icon: IconAnalyze },
			{ to: '/buscar', label: 'Buscar', icon: IconSearch },
			{ to: '/mapa', label: 'Mapa', icon: IconMap2 }
		]
	},
	{
		label: 'Contenido',
		items: [
			{ to: '/contenidos', label: 'Biblioteca', icon: IconStack2 },
			{ to: '/nuevo', label: 'Nuevo contenido', icon: IconSquarePlus },
			{ to: '/lote', label: 'Carga CSV', icon: IconFileTypeCsv }
		]
	}
];

export interface ActiveNavItem {
	groupLabel: string;
	item: NavItem;
}

/** Resolves the active nav item for a given pathname (no match → null). */
export function findActiveNavItem(pathname: string): ActiveNavItem | null {
	for (const group of NAV_GROUPS) {
		for (const item of group.items) {
			const isMatch = item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to);
			if (isMatch) {
				return { groupLabel: group.label, item };
			}
		}
	}
	return null;
}
