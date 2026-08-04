// The 8 categories are domain values and arrive from the API in Spanish.
// The API never returns this list (contract §3.9), so the front keeps it here.
export const CATEGORIES = [
	'Backend',
	'Frontend',
	'Móvil',
	'Datos e IA',
	'DevOps y Cloud',
	'Bases de datos',
	'Seguridad',
	'Fundamentos'
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SEARCH_MODES = [
	{ value: 'semantic', label: 'Semántica' },
	{ value: 'keyword', label: 'Palabras clave' }
] as const;

export type SearchMode = (typeof SEARCH_MODES)[number]['value'];
