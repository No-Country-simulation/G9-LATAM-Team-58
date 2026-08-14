// TypeScript mirror of the Spring Boot API (`api/`) surface consumed by the web.
// Field names stay in English per the repo language rule; categories arrive in
// Spanish and are rendered as-is. If a contract changes, change it here first.
//
// These are plain interfaces, not runtime-validated: the app trusts the API to
// match this shape and does not re-check it on every response.

/* ---------- Contents ---------- */

export interface ContentSummary {
	id: string;
	title: string;
	category: string;
	source: string;
	language: string;
	addedAt: string;
}

export interface ContentListResponse {
	total: number;
	items: ContentSummary[];
}

export interface ContentDetail extends ContentSummary {
	body: string;
	// Seeded corpus rows never went through /predict, so this column is null
	// for them (contents.probability is a nullable FLOAT).
	probability: number | null;
	keywords: string[];
	explanation: string[];
	url: string | null;
}

export interface RelatedItem {
	id: string;
	title: string;
	category: string;
	similarity: number;
}

export interface RelatedContentResponse {
	id: string;
	title: string;
	related: RelatedItem[];
}

/* ---------- Content ingestion (POST /content, 201) ---------- */

export interface IngestionResponse {
	id: string;
	category: string;
	probability: number;
	keywords: string[];
	related: RelatedItem[];
	explanation: string[];
}

/* ---------- Batch upload (POST /contents/batch) ---------- */

export interface BatchUploadResponse {
	processed: number;
	failed: number;
	ids: string[];
	errors: { row: number; reason: string }[];
	byCategory: Record<string, number>;
}

/* ---------- Search (GET /search) ---------- */

export interface SearchResult {
	id: string;
	title: string;
	category: string;
	similarity: number;
}

export interface SearchResponse {
	mode: string;
	// Overall hit count across all pages (`countAll`/`countByCategory` on the
	// server), not the size of this page — safe to use for numbered pagination.
	total: number;
	elapsedMs: number;
	results: SearchResult[];
}

/* ---------- Map (GET /map) ---------- */

export interface MapPoint {
	id: string;
	title: string;
	category: string;
	x: number;
	y: number;
	// Optional: the backend does not expose clusters yet, so this stays
	// undefined until it does.
	clusterId?: number | null;
}

/* ---------- Stats (GET /stats) ---------- */

export interface StatsResponse {
	total: number;
	// Only categories with at least one row appear; treat missing keys as 0.
	byCategory: Record<string, number>;
	addedThisWeek: number;
}

/* ---------- Model (GET /model) ---------- */

export interface ModelResponse {
	version: string;
	embeddingModel: string;
	dim: number;
	macroF1: number;
}

/* ---------- Error envelope (GlobalExceptionHandler) ---------- */

export interface ApiErrorResponse {
	error: string;
	message: string;
	timestamp?: string;
}
