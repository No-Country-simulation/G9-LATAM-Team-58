import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { zodResolver } from './zod-resolver';

describe('zodResolver', () => {
	it('returns the parsed (transformed) values with no errors on success', async () => {
		const schema = z.object({ title: z.string().trim().min(1) });
		const resolver = zodResolver(schema);

		const result = await resolver({ title: '  hello  ' }, undefined, { fields: {}, shouldUseNativeValidation: false });

		expect(result.errors).toEqual({});
		expect(result.values).toEqual({ title: 'hello' });
	});

	it('keeps only the first error per field', async () => {
		const schema = z.object({ title: z.string().min(5).email() });
		const resolver = zodResolver(schema);

		const result = await resolver({ title: 'ab' }, undefined, { fields: {}, shouldUseNativeValidation: false });

		expect(result.values).toEqual({});
		expect(Object.keys(result.errors)).toEqual(['title']);
		expect(result.errors.title?.message).toBeTruthy();
	});

	it('joins nested paths with a dot', async () => {
		const schema = z.object({ nested: z.object({ field: z.string().min(1) }) });
		const resolver = zodResolver(schema);

		const result = await resolver({ nested: { field: '' } }, undefined, {
			fields: {},
			shouldUseNativeValidation: false
		});

		expect(Object.keys(result.errors)).toEqual(['nested.field']);
	});

	it('falls back to "root" for a top-level (empty path) issue', async () => {
		const schema = z.object({}).refine(() => false, { message: 'Combinación inválida.' });
		const resolver = zodResolver(schema);

		const result = await resolver({}, undefined, { fields: {}, shouldUseNativeValidation: false });

		expect(Object.keys(result.errors)).toEqual(['root']);
	});
});
