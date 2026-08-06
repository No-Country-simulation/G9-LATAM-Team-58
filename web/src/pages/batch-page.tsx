import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { BatchStepper, BatchUploadPanel, useBatchUpload } from '@/features/batch-upload';

export function BatchPage() {
	const batch = useBatchUpload();
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [hasStepError, setHasStepError] = useState(false);

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pt-8 pb-20">
			<PageHeader
				title="Cargar contenido por lotes"
				description="Sube un CSV y el modelo clasificará cada fila automáticamente."
			/>
			<BatchStepper current={step} hasError={hasStepError} />
			<BatchUploadPanel
				isPending={batch.isPending}
				error={batch.error}
				data={batch.data ?? null}
				onUpload={file => batch.mutate(file)}
				onReset={() => batch.reset()}
				onStepChange={(nextStep, hasError) => {
					setStep(nextStep);
					setHasStepError(hasError);
				}}
			/>
		</div>
	);
}
