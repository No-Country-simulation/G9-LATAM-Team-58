import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as formatModule from '../format';
import { BatchDropzone } from './batch-dropzone';

function setup() {
	const onFileChange = vi.fn();
	const onDragEnter = vi.fn();
	const onDragOver = vi.fn();
	const onDragLeave = vi.fn();
	const onDrop = vi.fn();
	const { container } = render(
		<BatchDropzone
			isDragging={false}
			onFileChange={onFileChange}
			onDragEnter={onDragEnter}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		/>
	);
	return { container, onFileChange, onDragEnter, onDragOver, onDragLeave, onDrop };
}

describe('BatchDropzone', () => {
	it('invokes onFileChange when a file is selected via the hidden input', async () => {
		const user = userEvent.setup();
		const { container, onFileChange } = setup();
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		const file = new File(['title,body'], 'data.csv', { type: 'text/csv' });

		await user.upload(input, file);

		expect(onFileChange).toHaveBeenCalledTimes(1);
	});

	it('forwards drag events to the corresponding handlers', () => {
		const { container, onDragEnter, onDragOver, onDragLeave, onDrop } = setup();
		const label = container.querySelector('label') as HTMLLabelElement;

		fireEvent.dragEnter(label);
		fireEvent.dragOver(label);
		fireEvent.dragLeave(label);
		fireEvent.drop(label);

		expect(onDragEnter).toHaveBeenCalledTimes(1);
		expect(onDragOver).toHaveBeenCalledTimes(1);
		expect(onDragLeave).toHaveBeenCalledTimes(1);
		expect(onDrop).toHaveBeenCalledTimes(1);
	});

	it('downloads the CSV template without triggering file selection', async () => {
		const spy = vi.spyOn(formatModule, 'downloadTemplate').mockImplementation(() => {});
		const user = userEvent.setup();
		const { onFileChange } = setup();

		await user.click(screen.getByRole('button', { name: /descargar plantilla/i }));

		expect(spy).toHaveBeenCalledTimes(1);
		expect(onFileChange).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});
