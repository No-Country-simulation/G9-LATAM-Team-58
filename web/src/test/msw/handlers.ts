import { http, HttpResponse } from 'msw';
import type {
	BatchUploadResponse,
	ContentDetail,
	ContentListResponse,
	IngestionResponse,
	MapPoint,
	ModelResponse,
	RelatedContentResponse,
	SearchResponse,
	StatsResponse
} from '@/shared/api/contracts';

// `env.apiBaseUrl` can point anywhere (dev default, or whatever VITE_API_URL a
// developer's .env.local sets — Vite loads .env.local for the `test` mode too).
// Matching on `*<path>` intercepts the request regardless of origin, so the
// mocks stay valid no matter who runs the suite or from where.
function apiPath(path: string): string {
	return `*${path}`;
}

const statsResponse: StatsResponse = {
	total: 2,
	byCategory: { Backend: 1, 'Datos e IA': 1 },
	addedThisWeek: 1
};

const modelResponse: ModelResponse = {
	version: '1.0.0',
	embeddingModel: 'intfloat/multilingual-e5-small',
	dim: 384,
	macroF1: 0.87
};

const searchResponse: SearchResponse = {
	mode: 'semantic',
	total: 1,
	elapsedMs: 12,
	results: [{ id: '1', title: 'Título de ejemplo', category: 'Backend', similarity: 0.92 }]
};

const contentListResponse: ContentListResponse = {
	total: 1,
	items: [
		{
			id: '1',
			title: 'Título de ejemplo',
			category: 'Backend',
			source: 'blog',
			language: 'es',
			addedAt: '2026-01-01T00:00:00Z'
		}
	]
};

const contentDetailResponse: ContentDetail = {
	id: '1',
	title: 'Título de ejemplo',
	category: 'Backend',
	source: 'blog',
	language: 'es',
	addedAt: '2026-01-01T00:00:00Z',
	body: 'Cuerpo del contenido de ejemplo.',
	probability: 0.91,
	keywords: ['api', 'spring'],
	explanation: ['api', 'spring'],
	url: null
};

const relatedResponse: RelatedContentResponse = {
	id: '1',
	title: 'Título de ejemplo',
	related: [{ id: '2', title: 'Otro contenido', category: 'Backend', similarity: 0.81 }]
};

const ingestionResponse: IngestionResponse = {
	id: '3',
	category: 'Backend',
	probability: 0.95,
	keywords: ['api'],
	related: [],
	explanation: ['api']
};

const batchUploadResponse: BatchUploadResponse = {
	processed: 2,
	failed: 0,
	ids: ['4', '5'],
	errors: [],
	byCategory: { Backend: 2 }
};

const mapPoints: MapPoint[] = [{ id: '1', title: 'Título de ejemplo', category: 'Backend', x: 0.1, y: 0.2 }];

export const handlers = [
	http.get(apiPath('/stats'), () => HttpResponse.json(statsResponse)),
	http.get(apiPath('/model'), () => HttpResponse.json(modelResponse)),
	http.get(apiPath('/search'), () => HttpResponse.json(searchResponse)),
	http.get(apiPath('/contents'), () => HttpResponse.json(contentListResponse)),
	http.get(apiPath('/contents/:id'), () => HttpResponse.json(contentDetailResponse)),
	http.get(apiPath('/contents/:id/related'), () => HttpResponse.json(relatedResponse)),
	http.post(apiPath('/content'), () => HttpResponse.json(ingestionResponse, { status: 201 })),
	http.post(apiPath('/contents/batch'), () => HttpResponse.json(batchUploadResponse)),
	http.get(apiPath('/map'), () => HttpResponse.json(mapPoints))
];

export { apiPath };
