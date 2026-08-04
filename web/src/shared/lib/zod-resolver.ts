import type { FieldError, FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import { z } from 'zod';

// Minimal synchronous zod resolver for react-hook-form v7 (no
// @hookform/resolvers dependency). `schema` output becomes the typed form
// values, so `.trim()`-style transforms apply before `handleSubmit`.
export function zodResolver<T extends FieldValues, S extends z.ZodType<T>>(schema: S): Resolver<T> {
	return values => {
		const parsed = schema.safeParse(values);

		if (parsed.success) {
			return { values: parsed.data, errors: {} };
		}

		const errors: FieldErrors<T> = {};
		const fields = errors as Record<string, FieldError | undefined>;
		for (const issue of parsed.error.issues) {
			const name = issue.path.join('.') || 'root';
			if (!fields[name]) {
				fields[name] = { type: issue.code, message: issue.message };
			}
		}
		return { values: {}, errors };
	};
}
