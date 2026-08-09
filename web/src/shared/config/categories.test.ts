import { describe, expect, it } from 'vitest';
import { categoryColorVar, categoryStyle } from './categories';

const CATEGORY_VARS: Record<string, string> = {
	Backend: '--cat-backend',
	Frontend: '--cat-frontend',
	Móvil: '--cat-movil',
	'Datos e IA': '--cat-datos-ia',
	'DevOps y Cloud': '--cat-devops-cloud',
	'Bases de datos': '--cat-bases-de-datos',
	Seguridad: '--cat-seguridad',
	Fundamentos: '--cat-fundamentos'
};

describe('categoryColorVar', () => {
	it.each(Object.entries(CATEGORY_VARS))('maps %s to its CSS variable', (category, expectedVar) => {
		expect(categoryColorVar(category)).toBe(expectedVar);
	});

	it('falls back to --muted-foreground for an unknown category', () => {
		expect(categoryColorVar('No existe')).toBe('--muted-foreground');
	});
});

describe('categoryStyle', () => {
	it('wraps the resolved variable as a --cat custom property', () => {
		expect(categoryStyle('Backend')).toEqual({ '--cat': 'var(--cat-backend)' });
	});

	it('falls back for an unknown category', () => {
		expect(categoryStyle('No existe')).toEqual({ '--cat': 'var(--muted-foreground)' });
	});
});
