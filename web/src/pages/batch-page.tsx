import { PageHeader } from '@/components/layout/page-header';
import { useLoadingCompletion } from '@/shared/hooks/use-loading-completion';
import { BatchStepper, BatchUploadPanel, useBatchFile, useBatchUpload } from '@/features/batch-upload';

export function BatchPage() {
	const batch = useBatchUpload();
	const batchFile = useBatchFile(() => batch.reset());
	const loading = useLoadingCompletion({ isPending: batch.isPending, isComplete: Boolean(batch.data) });

	const hasSchemaError =
		Boolean(batchFile.parse && !batchFile.parse.ok) || Boolean(batchFile.validationError) || Boolean(batch.error);
	const step: 1 | 2 | 3 = loading.isVisible ? 2 : batch.data ? 3 : 1;

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pt-8 pb-20">
			<PageHeader
				title="Cargar contenido por lotes"
				description="Sube un CSV y el modelo clasificará cada fila automáticamente."
			/>
			<BatchStepper current={step} hasError={step === 1 && hasSchemaError} />
			<BatchUploadPanel
				isPending={batch.isPending}
				error={batch.error}
				data={batch.data ?? null}
				loading={loading}
				batchFile={batchFile}
				onUpload={file => batch.mutate(file)}
				onReset={() => batch.reset()}
			/>
		</div>
	);
}
