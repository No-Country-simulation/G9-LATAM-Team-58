import type { CSSProperties } from 'react';
import type { Category } from '@/shared/config/constants';

/**
 * Each category owns a colour, defined as an oklch CSS variable in
 * `src/styles/index.css` (both `:root` and `.dark`). This map holds the variable
 * names, never the colour values: the theme decides the actual colour.
 *
 * Use it only for pills, dots and bars — never as a panel background.
 */
const CATEGORY_COLOR_VAR: Record<Category, string> = {
	Backend: '--cat-backend',
	Frontend: '--cat-frontend',
	Móvil: '--cat-movil',
	'Datos e IA': '--cat-datos-ia',
	'DevOps y Cloud': '--cat-devops-cloud',
	'Bases de datos': '--cat-bases-de-datos',
	Seguridad: '--cat-seguridad',
	Fundamentos: '--cat-fundamentos'
};

const FALLBACK_COLOR_VAR = '--muted-foreground';

/**
 * Exposes the category colour as a local `--cat` variable so Tailwind can consume
 * it (`text-(--cat)`, `bg-(--cat)/12`…). Unknown categories fall back to the muted
 * foreground instead of breaking the layout.
 */
export function categoryStyle(category: string): CSSProperties {
	const variable = CATEGORY_COLOR_VAR[category as Category] ?? FALLBACK_COLOR_VAR;
	return { '--cat': `var(${variable})` } as CSSProperties;
}

/**
 * The raw CSS variable name for a category's colour. For contexts that can't
 * consume `var(...)` at all — Canvas `fillStyle` needs a resolved colour string,
 * read via `getComputedStyle` — not for anything that renders as DOM/CSS.
 */
export function categoryColorVar(category: string): string {
	return CATEGORY_COLOR_VAR[category as Category] ?? FALLBACK_COLOR_VAR;
}
