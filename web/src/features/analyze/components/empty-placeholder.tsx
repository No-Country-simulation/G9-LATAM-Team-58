import { IconChartDots3 } from '@tabler/icons-react';
import { EmptyState } from '@/components/data-display';

export function EmptyPlaceholder({ description = 'El resultado de la clasificación aparecerá aquí.' }) {
	return <EmptyState icon={IconChartDots3} title="Sin análisis todavía" description={description} />;
}
