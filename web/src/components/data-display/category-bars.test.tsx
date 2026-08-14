import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CATEGORIES } from '@/shared/config/constants';
import { CategoryBars } from './category-bars';

describe('CategoryBars', () => {
	it('renders all 8 canonical categories, including zero-count ones, in fixed order', () => {
		render(<CategoryBars byCategory={{ Backend: 3 }} />);

		const rendered = CATEGORIES.map(category => screen.getByText(category));
		expect(rendered).toHaveLength(CATEGORIES.length);
	});

	it('sorts by count descending and drops zero-count rows in "count" order', () => {
		render(<CategoryBars byCategory={{ Backend: 1, Frontend: 5 }} order="count" />);

		const names = screen.getAllByText(/Backend|Frontend/).map(node => node.textContent);
		expect(names).toEqual(['Frontend', 'Backend']);
		expect(screen.queryByText('Seguridad')).not.toBeInTheDocument();
	});

	it('shows the percentage share of the grand total when requested', () => {
		render(<CategoryBars byCategory={{ Backend: 1, Frontend: 3 }} order="count" showPercentage />);

		expect(screen.getByText('3 (75%)')).toBeInTheDocument();
		expect(screen.getByText('1 (25%)')).toBeInTheDocument();
	});

	it('treats a missing category key as a count of 0', () => {
		render(<CategoryBars byCategory={{}} />);

		expect(screen.getAllByText('0')).toHaveLength(CATEGORIES.length);
	});
});
