import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { AnalyzeForm } from './analyze-form';

function setup(props: Partial<ComponentProps<typeof AnalyzeForm>> = {}) {
	const onSubmit = vi.fn();
	const onReset = vi.fn();
	renderWithProviders(
		<AnalyzeForm isPending={false} hasResult={false} onSubmit={onSubmit} onReset={onReset} {...props} />
	);
	return { onSubmit, onReset };
}

describe('AnalyzeForm', () => {
	it('shows Spanish validation messages when submitted empty', async () => {
		const user = userEvent.setup();
		const { onSubmit } = setup();

		await user.click(screen.getByRole('button', { name: /analizar/i }));

		expect(await screen.findByText('Escribe un título para el contenido.')).toBeInTheDocument();
		expect(screen.getByText('Pega aquí el texto a analizar.')).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('blocks content over 5000 characters', async () => {
		const user = userEvent.setup();
		const { onSubmit } = setup();

		await user.type(screen.getByLabelText('Título'), 'T');
		// The textarea's `maxLength=5000` blocks going over the limit through real
		// typing/paste, so this bypasses the DOM constraint to exercise the zod
		// schema's own max() check directly, as defense in depth would require.
		fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'a'.repeat(5001) } });
		await user.click(screen.getByRole('button', { name: /analizar/i }));

		expect(await screen.findByText('El contenido supera los 5.000 caracteres.')).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('submits trimmed title and body on valid input', async () => {
		const user = userEvent.setup();
		const { onSubmit } = setup();

		await user.type(screen.getByLabelText('Título'), '  Mi título  ');
		await user.type(screen.getByLabelText('Texto'), '  Mi cuerpo  ');
		await user.click(screen.getByRole('button', { name: /analizar/i }));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Mi título', body: 'Mi cuerpo' });
	});

	it('shows "Analizar otro" instead of the submit button once there is a result', async () => {
		const user = userEvent.setup();
		const { onReset } = setup({ hasResult: true });

		const resetButton = screen.getByRole('button', { name: /analizar otro/i });
		await user.click(resetButton);

		expect(onReset).toHaveBeenCalled();
		expect(screen.queryByRole('button', { name: /^analizar$/i })).not.toBeInTheDocument();
	});
});
