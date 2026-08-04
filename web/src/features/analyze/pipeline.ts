export type PipelineStepState = 'done' | 'active' | 'pending';

export interface PipelineStep {
	id: string;
	label: string;
	state: PipelineStepState;
	/** Elapsed time shown on the right. Only meaningful for finished steps. */
	elapsed?: string;
}

/**
 * The inference pipeline as the user sees it while waiting.
 *
 * `POST /content` answers only once the whole pipeline has finished, so there
 * is no streaming to subscribe to: these states are a fixed, decorative
 * rendition of what the model actually does. Keep the labels in sync with the
 * real steps in `inference/`.
 */
export const INFERENCE_PIPELINE: PipelineStep[] = [
	{ id: 'normalize', label: 'Normalizando texto', state: 'done', elapsed: '12 ms' },
	{ id: 'embed', label: 'Generando embedding (384d)', state: 'done', elapsed: '148 ms' },
	{ id: 'classify', label: 'Clasificando categoría', state: 'active' },
	{ id: 'keywords', label: 'Extrayendo palabras clave', state: 'pending' },
	{ id: 'related', label: 'Buscando contenido similar', state: 'pending' }
];
