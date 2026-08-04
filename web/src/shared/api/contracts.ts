import { z } from 'zod';

// TypeScript mirror of docs/CONTRATOS.md §3 (public API consumed by the web).
// Field names stay in English per the repo language rule; categories arrive in
// Spanish and are rendered as-is. If a contract changes, change it here first.

/* ---------- Contents ---------- */

export const contentSummarySchema = z.object({
	id: z.string(),
	title: z.string(),
	category: z.string(),
	source: z.string(),
	language: z.string(),
	addedAt: z.string()
});
export const contentListSchema = z.array(contentSummarySchema);

export const contentDetailSchema = contentSummarySchema.extend({
	body: z.string(),
	probability: z.number(),
	keywords: z.array(z.string()),
	explanation: z.array(z.string()),
	url: z.string().nullable()
});

export const relatedItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	category: z.string(),
	similarity: z.number()
});

export const relatedContentResponseSchema = z.object({
	id: z.string(),
	title: z.string(),
	related: z.array(relatedItemSchema)
});

/* ---------- Content ingestion (POST /content, 201) ---------- */

export const ingestionResponseSchema = z.object({
	id: z.string(),
	category: z.string(),
	probability: z.number(),
	keywords: z.array(z.string()),
	related: z.array(relatedItemSchema),
	explanation: z.array(z.string())
});

/* ---------- Batch upload (POST /contents/batch) ---------- */

export const batchUploadResponseSchema = z.object({
	processed: z.number(),
	failed: z.number(),
	ids: z.array(z.string()),
	errors: z.array(z.object({ row: z.number(), reason: z.string() })),
	byCategory: z.record(z.string(), z.number())
});

/* ---------- Search (GET /search) ---------- */

export const searchResultSchema = z.object({
	id: z.string(),
	title: z.string(),
	category: z.string(),
	similarity: z.number()
});

export const searchResponseSchema = z.object({
	mode: z.string(),
	// WARNING: `total` is the page size, not the overall hit count (contract §3.6).
	total: z.number(),
	elapsedMs: z.number(),
	results: z.array(searchResultSchema)
});

/* ---------- Map (GET /map) ---------- */

export const mapPointSchema = z.object({
	id: z.string(),
	title: z.string(),
	category: z.string(),
	x: z.number(),
	y: z.number()
});
export const mapPointsSchema = z.array(mapPointSchema);

/* ---------- Stats (GET /stats) ---------- */

export const statsResponseSchema = z.object({
	total: z.number(),
	// Only categories with at least one row appear; treat missing keys as 0.
	byCategory: z.record(z.string(), z.number()),
	addedThisWeek: z.number()
});

/* ---------- Model (GET /model) ---------- */

export const modelResponseSchema = z.object({
	version: z.string(),
	embeddingModel: z.string(),
	dim: z.number(),
	macroF1: z.number()
});

/* ---------- Error envelope (GlobalExceptionHandler) ---------- */

export const apiErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string().optional()
});

/* ---------- Inferred types ---------- */

export type ContentSummary = z.infer<typeof contentSummarySchema>;
export type ContentDetail = z.infer<typeof contentDetailSchema>;
export type RelatedItem = z.infer<typeof relatedItemSchema>;
export type RelatedContentResponse = z.infer<typeof relatedContentResponseSchema>;
export type IngestionResponse = z.infer<typeof ingestionResponseSchema>;
export type BatchUploadResponse = z.infer<typeof batchUploadResponseSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type MapPoint = z.infer<typeof mapPointSchema>;
export type StatsResponse = z.infer<typeof statsResponseSchema>;
export type ModelResponse = z.infer<typeof modelResponseSchema>;
