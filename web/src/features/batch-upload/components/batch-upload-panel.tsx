import { useEffect, useRef, useState } from 'react';
import { ErrorBanner } from '@/components/feedback/error-banner';
import type { ApiError } from '@/shared/api/client';
import type { BatchUploadResponse } from '@/shared/api/contracts';
import { useLoadingCompletion } from '@/shared/hooks/use-loading-completion';
import { useBatchFile } from '../use-batch-file';
import { BatchCategoryBreakdown } from './batch-category-breakdown';
import { BatchDropzone } from './batch-dropzone';
import { BatchErrorTable } from './batch-error-table';
import { BatchFilePreview } from './batch-file-preview';
import { BatchFormatCard } from './batch-format-card';
import { BatchProcessingPanel } from './batch-processing-panel';
import { BatchResultSummary } from './batch-result-summary';
import { BatchSchemaError } from './batch-schema-error';

interface BatchUploadPanelProps {
	isPending: boolean;
	error: ApiError | null;
	data: BatchUploadResponse | null;
	onUpload: (file: File) => void;
	onReset: () => void;
	onStepChange?: (step: 1 | 2 | 3, hasError: boolean) => void;
}

/** Routes the five states of the batch flow; each one owns its layout. */
export function BatchUploadPanel({ isPending, error, data, onUpload, onReset, onStepChange }: BatchUploadPanelProps) {
	const loading = useLoadingCompletion({ isPending, isComplete: Boolean(data) });
	const batchFile = useBatchFile(onReset);

	const startedAtRef = useRef<number | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	useEffect(() => {
		if (isPending && startedAtRef.current === null) {
			startedAtRef.current = Date.now();
		}
		if (!isPending && data && startedAtRef.current !== null) {
			setElapsedSeconds((Date.now() - startedAtRef.current) / 1000);
			startedAtRef.current = null;
		}
	}, [isPending, data]);

	const hasSchemaError =
		Boolean(batchFile.parse && !batchFile.parse.ok) || Boolean(batchFile.validationError) || Boolean(error);

	useEffect(() => {
		if (loading.isVisible) onStepChange?.(2, false);
		else if (data) onStepChange?.(3, false);
		else onStepChange?.(1, hasSchemaError);
	}, [loading.isVisible, data, hasSchemaError, onStepChange]);

	function handleUpload() {
		if (batchFile.file && !isPending) onUpload(batchFile.file);
	}

	function handleReset() {
		batchFile.clear();
		onReset();
	}

	if (loading.isVisible) {
		return (
			<BatchProcessingPanel
				progress={loading.progress}
				totalRows={batchFile.parse?.ok ? batchFile.parse.data.totalRows : 0}
			/>
		);
	}

	if (data) {
		return (
			<section className="flex flex-col gap-5">
				<BatchResultSummary result={data} elapsedSeconds={elapsedSeconds} onReset={handleReset} />
				<BatchCategoryBreakdown byCategory={data.byCategory} />
				<BatchErrorTable errors={data.errors} />
			</section>
		);
	}

	if (batchFile.file && batchFile.isParsing) {
		return (
			<section className="flex min-h-64 items-center justify-center rounded-md border bg-card p-8 text-sm text-muted-foreground">
				Leyendo el archivo…
			</section>
		);
	}

	if (batchFile.parse && !batchFile.parse.ok) {
		return <BatchSchemaError result={batchFile.parse} onChooseAnother={handleReset} />;
	}

	if (batchFile.file && batchFile.parse?.ok) {
		return (
			<BatchFilePreview
				file={batchFile.file}
				parsed={batchFile.parse.data}
				isPending={isPending}
				onRemove={handleReset}
				onUpload={handleUpload}
			/>
		);
	}

	return (
		<section className="flex flex-col gap-4">
			<BatchDropzone
				isDragging={batchFile.isDragging}
				onFileChange={batchFile.handleFileChange}
				onDragEnter={batchFile.handleDragEnter}
				onDragOver={batchFile.handleDragOver}
				onDragLeave={batchFile.handleDragLeave}
				onDrop={batchFile.handleDrop}
			/>

			<BatchFormatCard />

			{batchFile.validationError && (
				<div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
					{batchFile.validationError}
				</div>
			)}

			{error && <ErrorBanner title="No se pudo procesar el archivo" error={error} onRetry={handleUpload} />}
		</section>
	);
}
