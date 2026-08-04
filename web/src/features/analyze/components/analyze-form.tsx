import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { IconArrowRight, IconLoader2, IconRotate } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/form/form-input';
import { FormTextArea } from '@/components/form/form-text-area';
import { zodResolver } from '@/shared/lib/zod-resolver';
import { cn } from '@/shared/lib/utils';
import { ANALYZE_TEMPLATES, type AnalyzeTemplate } from '../templates';
import { TemplateChips } from './template-chips';
import type { AnalyzeInput } from '../api';

interface AnalyzeFormProps {
	isPending: boolean;
	/** Once there is a result the primary action becomes "analyze another one". */
	hasResult: boolean;
	onSubmit: (input: AnalyzeInput) => void;
	onReset: () => void;
}

const MAX_BODY_LENGTH = 5_000;

// Mono uppercase captions, per the design system.
const FIELD_LABEL = 'font-mono text-[11px] tracking-[0.06em] uppercase text-muted-foreground';

const analyzeFormSchema = z.object({
	title: z.string().trim().nonempty('Escribe un título para el contenido.'),
	body: z
		.string()
		.trim()
		.nonempty('Pega aquí el texto a analizar.')
		.max(MAX_BODY_LENGTH, 'El contenido supera los 5.000 caracteres.')
});

type AnalyzeFormValues = z.infer<typeof analyzeFormSchema>;

export function AnalyzeForm({ isPending, hasResult, onSubmit, onReset }: AnalyzeFormProps) {
	const { control, handleSubmit, setValue, clearErrors, formState } = useForm<AnalyzeFormValues>({
		resolver: zodResolver(analyzeFormSchema),
		defaultValues: { title: '', body: '' }
	});

	const body = useWatch({ control, name: 'body' }) ?? '';
	const hasBodyError = !!formState.errors.body;

	function handleAnalyze(values: AnalyzeFormValues) {
		onSubmit({ title: values.title, body: values.body });
	}

	function applyTemplate(template: AnalyzeTemplate) {
		setValue('title', template.title, { shouldDirty: true });
		setValue('body', template.body, { shouldDirty: true });
		clearErrors(['title', 'body']);
	}

	return (
		<form onSubmit={handleSubmit(handleAnalyze)} className="flex h-full min-h-0 flex-col gap-5">
			<FormInput
				control={control}
				name="title"
				label="Título"
				labelClassName={FIELD_LABEL}
				placeholder="Ej. Introducción a los índices en PostgreSQL"
				maxLength={200}
				disabled={isPending}
			/>

			<div className="relative flex min-h-0 flex-1 flex-col *:data-[slot=field]:flex-1">
				<FormTextArea
					control={control}
					name="body"
					label="Texto"
					labelClassName={FIELD_LABEL}
					placeholder="Pega aquí el texto a analizar…"
					maxLength={MAX_BODY_LENGTH}
					disabled={isPending}
					className="h-full min-h-60 flex-1 resize-none text-sm leading-relaxed"
				/>
				<span
					className={cn(
						'pointer-events-none absolute right-3 font-mono text-[11px] tabular-nums',
						hasBodyError ? 'bottom-9 text-destructive' : 'bottom-3 text-text-dim'
					)}
				>
					{body.length.toLocaleString('es')} / {MAX_BODY_LENGTH.toLocaleString('es')}
				</span>
			</div>

			<TemplateChips templates={ANALYZE_TEMPLATES} onSelect={applyTemplate} disabled={isPending} />

			<div className="border-t pt-5">
				{hasResult ? (
					<Button type="button" variant="outline" className="w-full" data-icon="inline-start" onClick={onReset}>
						<IconRotate />
						Analizar otro
					</Button>
				) : (
					<Button
						type="submit"
						size="lg"
						className="w-full dark:shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
						data-icon="inline-end"
						disabled={isPending}
					>
						{isPending ? (
							<>
								<IconLoader2 className="animate-spin" />
								Analizando…
							</>
						) : (
							<>
								Analizar
								<IconArrowRight />
							</>
						)}
					</Button>
				)}
			</div>
		</form>
	);
}
