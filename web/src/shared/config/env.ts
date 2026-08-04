// Single knob for the API location: VITE_API_URL (see .env.example).
// Defaults: local API in dev, '/api' (nginx strips the prefix) in prod builds.
// The API serves root paths (/search, /contents...), so the URL has no suffix.
export const env = {
	apiBaseUrl: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '/api')
} as const;
