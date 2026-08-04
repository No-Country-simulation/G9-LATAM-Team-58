import type { AnalyzeTemplate } from '../templates';

interface TemplateChipsProps {
	templates: AnalyzeTemplate[];
	onSelect: (template: AnalyzeTemplate) => void;
	disabled?: boolean;
}

/** Sample texts that fill the form in one click, for demos and first runs. */
export function TemplateChips({ templates, onSelect, disabled }: TemplateChipsProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{templates.map(template => (
				<button
					key={template.key}
					type="button"
					onClick={() => onSelect(template)}
					disabled={disabled}
					className="rounded-md border border-outline px-3 py-1.5 font-mono text-[11px] whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
				>
					Ejemplo: {template.label}
				</button>
			))}
		</div>
	);
}
