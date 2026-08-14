// One /predict call per CSV row (see api.ts), so the caps keep a batch from
// running long enough to hit the 300s upload timeout.
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Must match MAX_ROWS in BatchUploadServiceImpl: the API rejects anything above
// this with a 400, and checking here too turns a wasted upload into an instant
// local error. Raising one side alone just moves where the failure appears.
export const MAX_ROWS = 200;

export const ACCEPTED_EXTENSION = '.csv';

// Column names match the backend parser (BatchUploadServiceImpl.parseCsvLine),
// not the Spanish the Stitch mock uses — a "título,texto" file would 400.
export const REQUIRED_COLUMNS = ['title', 'body'] as const;

export const CSV_TEMPLATE = [
	'title,body',
	'"Índices vectoriales","Un índice HNSW aproxima, con error acotado, el vecino más cercano"',
	'"React y Suspense","Suspense permite declarar estados de carga"'
].join('\n');
