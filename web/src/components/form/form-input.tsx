import type { ComponentProps } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

// The spread must not leak the props react-hook-form owns.
type FormInputProps<TFieldValues extends FieldValues> = {
	control: Control<TFieldValues>;
	name: FieldPath<TFieldValues>;
	label: string;
	description?: string;
	/** Restyles the label without touching the shadcn Field primitives. */
	labelClassName?: string;
} & Omit<ComponentProps<'input'>, 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref'>;

// Controlled Input wired to RHF with the Field anatomy (label + description +
// error). Remember to set defaultValues in useForm so the input stays
// controlled from the first render.
export function FormInput<TFieldValues extends FieldValues>({
	control,
	name,
	label,
	description,
	labelClassName,
	...inputProps
}: FormInputProps<TFieldValues>) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={field.name} className={labelClassName}>
						{label}
					</FieldLabel>
					<Input {...inputProps} {...field} id={field.name} aria-invalid={fieldState.invalid} />
					{description && <FieldDescription>{description}</FieldDescription>}
					{fieldState.invalid && <FieldError className="text-xs" errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	);
}
